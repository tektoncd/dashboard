/*
Copyright 2019-2020 The Tekton Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
		http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package broadcaster

import (
	"errors"
	"sync"
)

type MessageType string

// Reference outside of package
const (
	Log                          MessageType = "Log"
	NamespaceCreated             MessageType = "NamespaceCreated"
	NamespaceUpdated             MessageType = "NamespaceUpdated"
	NamespaceDeleted             MessageType = "NamespaceDeleted"
	PipelineCreated              MessageType = "PipelineCreated"
	PipelineDeleted              MessageType = "PipelineDeleted"
	PipelineUpdated              MessageType = "PipelineUpdated"
	ClusterTaskCreated           MessageType = "ClusterTaskCreated"
	ClusterTaskDeleted           MessageType = "ClusterTaskDeleted"
	ClusterTaskUpdated           MessageType = "ClusterTaskUpdated"
	TaskCreated                  MessageType = "TaskCreated"
	TaskDeleted                  MessageType = "TaskDeleted"
	TaskUpdated                  MessageType = "TaskUpdated"
	PipelineResourceCreated      MessageType = "PipelineResourceCreated"
	PipelineResourceDeleted      MessageType = "PipelineResourceDeleted"
	PipelineResourceUpdated      MessageType = "PipelineResourceUpdated"
	PipelineRunCreated           MessageType = "PipelineRunCreated"
	PipelineRunDeleted           MessageType = "PipelineRunDeleted"
	PipelineRunUpdated           MessageType = "PipelineRunUpdated"
	TaskRunCreated               MessageType = "TaskRunCreated"
	TaskRunDeleted               MessageType = "TaskRunDeleted"
	TaskRunUpdated               MessageType = "TaskRunUpdated"
	ConditionCreated             MessageType = "ConditionCreated"
	ConditionDeleted             MessageType = "ConditionDeleted"
	ConditionUpdated             MessageType = "ConditionUpdated"
	ResourceExtensionCreated     MessageType = "ResourceExtensionCreated"
	ResourceExtensionUpdated     MessageType = "ResourceExtensionUpdated"
	ResourceExtensionDeleted     MessageType = "ResourceExtensionDeleted"
	ServiceExtensionCreated      MessageType = "ServiceExtensionCreated"
	ServiceExtensionUpdated      MessageType = "ServiceExtensionUpdated"
	ServiceExtensionDeleted      MessageType = "ServiceExtensionDeleted"
	SecretCreated                MessageType = "SecretCreated"
	SecretDeleted                MessageType = "SecretDeleted"
	SecretUpdated                MessageType = "SecretUpdated"
	ServiceAccountCreated        MessageType = "ServiceAccountCreated"
	ServiceAccountDeleted        MessageType = "ServiceAccountDeleted"
	ServiceAccountUpdated        MessageType = "ServiceAccountUpdated"
	TriggerBindingCreated        MessageType = "TriggerBindingCreated"
	TriggerBindingDeleted        MessageType = "TriggerBindingDeleted"
	TriggerBindingUpdated        MessageType = "TriggerBindingUpdated"
	ClusterTriggerBindingCreated MessageType = "ClusterTriggerBindingCreated"
	ClusterTriggerBindingDeleted MessageType = "ClusterTriggerBindingDeleted"
	ClusterTriggerBindingUpdated MessageType = "ClusterTriggerBindingUpdated"
	TriggerTemplateCreated       MessageType = "TriggerTemplateCreated"
	TriggerTemplateDeleted       MessageType = "TriggerTemplateDeleted"
	TriggerTemplateUpdated       MessageType = "TriggerTemplateUpdated"
	EventListenerCreated         MessageType = "EventListenerCreated"
	EventListenerDeleted         MessageType = "EventListenerDeleted"
	EventListenerUpdated         MessageType = "EventListenerUpdated"
)

type SocketData struct {
	MessageType MessageType
	Payload     interface{}
}

// Only a pointer to the struct should be used
type Broadcaster struct {
	expired bool
	// Explicit name to specify locking condition
	expiredLock sync.Mutex
	subscribers *sync.Map //map[*Subscriber]struct{}
	c           chan SocketData
}

// Wrapper return type for subscriptions
type Subscriber struct {
	subChan   chan SocketData
	unsubChan chan struct{}
}

// Read-Only access to the subscription channel
// Open or nil, never closed
func (s *Subscriber) SubChan() <-chan SocketData {
	return s.subChan
}

// Closed on unsubscribe or when broadcast parent channel closes
func (s *Subscriber) UnsubChan() <-chan struct{} {
	return s.unsubChan
}

var expiredError error = errors.New("Broadcaster expired")

// Creates broadcaster from channel parameter and immediately starts broadcasting
// Without any subscribers, received data will be discarded
// Broadcaster should be the only channel reader
func NewBroadcaster(c chan SocketData) *Broadcaster {
	if c == nil {
		panic("Channel passed cannot be nil")
	}

	b := &Broadcaster{subscribers: new(sync.Map)}
	b.c = c
	go func() {
		for {
			msg, channelOpen := <-b.c
			if channelOpen {
				b.subscribers.Range(func(key, value interface{}) bool {
					subscriber := key.(*Subscriber)
					select {
					case subscriber.subChan <- msg:
					case <-subscriber.unsubChan:
					}
					return true
				})
			} else {
				b.expiredLock.Lock()
				b.expired = true
				b.subscribers.Range(func(key, value interface{}) bool {
					subscriber := key.(*Subscriber)
					close(subscriber.unsubChan)
					return true
				})
				// Remove references
				b.subscribers = nil
				b.expiredLock.Unlock()
				return
			}
		}
	}()
	return b
}

func (b *Broadcaster) Expired() bool {
	b.expiredLock.Lock()
	defer b.expiredLock.Unlock()
	return b.expired
}

// Subscriber expected to constantly consume or unsubscribe
func (b *Broadcaster) Subscribe() (*Subscriber, error) {
	b.expiredLock.Lock()
	defer b.expiredLock.Unlock()

	if b.expired {
		return &Subscriber{}, expiredError
	}
	newSub := &Subscriber{
		subChan:   make(chan SocketData),
		unsubChan: make(chan struct{}),
	}
	// Generate unique key
	b.subscribers.Store(newSub, struct{}{})
	return newSub, nil
}

func (b *Broadcaster) Unsubscribe(sub *Subscriber) error {
	b.expiredLock.Lock()
	defer b.expiredLock.Unlock()

	if b.expired {
		return expiredError
	}
	if _, ok := b.subscribers.Load(sub); ok {
		b.subscribers.Delete(sub)
		close(sub.unsubChan)
		return nil
	}
	return errors.New("Subscription not found")
}

// Iterates over sync.Map and returns number of elements
// Response can be oversized if counted subscriptions are cancelled while counting
func (b *Broadcaster) PoolSize() (size int) {
	b.expiredLock.Lock()
	defer b.expiredLock.Unlock()

	if b.expired {
		return 0
	}
	b.subscribers.Range(func(key, value interface{}) bool {
		size++
		return true
	})
	return size
}

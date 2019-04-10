/*
Copyright 2019 The Tekton Authors
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

type messageType string

// Reference outside of package
const (
	Log                messageType = "Log"
	PipelineRunCreated messageType = "PipelineRunCreated"
	PipelineRunDeleted messageType = "PipelineRunDeleted"
	PipelineRunUpdated messageType = "PipelineRunUpdated"
)

type SocketData struct {
	MessageType messageType
	Payload     interface{}
}

// Only a pointer to the struct should be used
type Broadcaster struct {
	expired     bool
	subscribers *sync.Map //map[&Subscriber]struct{}
	//c chan interface{}
	c chan SocketData
}

type Subscriber struct {
	subChan   chan SocketData
	unsubChan chan struct{}
}

// Open or nil, never closed
func (s *Subscriber) SubChan() <-chan SocketData {
	return s.subChan
}

// Closed on unsubscribe or when broadcast parent channel closes
func (s *Subscriber) UnsubChan() <-chan struct{} {
	return s.unsubChan
}

type expiredError struct{}

func (e expiredError) Error() string {
	return "Broadcaster expired"
}

// Creates broadcaster from channel parameter and immediately starts broadcasting
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
				b.expired = true
				b.subscribers.Range(func(key, value interface{}) bool {
					subscriber := key.(*Subscriber)
					subscriber.subChan = nil
					return true
				})
				// Remove references
				b.subscribers = nil
			}
		}
	}()
	return b
}

// Subscriber expected to constantly consume or unsubscribe
func (b *Broadcaster) Subscribe() (*Subscriber, error) {

	if b.expired {
		return &Subscriber{}, expiredError{}
	}
	newSub := &Subscriber{
		subChan:   make(chan SocketData),
		unsubChan: make(chan struct{}),
	}
	// Generate unique key
	b.subscribers.Store(newSub, struct{}{})
	return newSub, nil
}

// Should not be called from parallel goroutines, may panic
func (b *Broadcaster) Unsubscribe(sub *Subscriber) error {
	if b.expired {
		return expiredError{}
	}
	if _, ok := b.subscribers.Load(sub); ok {
		b.subscribers.Delete(sub)
		sub.subChan = nil
		close(sub.unsubChan)
		return nil
	}
	return errors.New("Subscription not found")
}

func (b *Broadcaster) PoolSize() (size int) {
	if b.expired {
		return 0
	}
	b.subscribers.Range(func(key, value interface{}) bool {
		size++
		return true
	})
	return
}

package broadcaster

import (
	"sync"
	"testing"
)

// Add and remove Subscribers
// PoolSize() should reflect proper size
func TestNormalSubUnsub(t *testing.T) {
	c := make(chan SocketData)
	broadcaster := NewBroadcaster(c)
	subs, _ := createSubscribers(t, broadcaster, 1)
	expectPoolSize(t, broadcaster, 1)
	broadcaster.Unsubscribe(subs[0])
	if err := broadcaster.Unsubscribe(subs[0]); err == nil {
		t.Error("Unsubscribing same subscriber twice did not return error")
	}
	expectPoolSize(t, broadcaster, 0)
	expectUnsubscribed(t, subs[0])
}

// Ensure Broadcaster expires and blocks sub/unsub
func TestExpiredSubUnsub(t *testing.T) {
	c := make(chan SocketData)
	broadcaster := NewBroadcaster(c)
	closeAwaitExpired(c, broadcaster)
	sub, err := broadcaster.Subscribe()
	if err == nil {
		t.Error("Expired broadcaster did NOT error on creating new subscription")
	}
	if err = broadcaster.Unsubscribe(sub); err == nil {
		t.Error("Expired broadcaster did NOT error unsubscribing")
	}
}

// Ensure closing the underlying channel clears the subscriber pool properly
func TestBroadcasterClose(t *testing.T) {
	c := make(chan SocketData)
	broadcaster := NewBroadcaster(c)
	subs, _ := createSubscribers(t, broadcaster, 1)
	closeAwaitExpired(c, broadcaster)
	expectPoolSize(t, broadcaster, 0)
	expectUnsubscribed(t, subs[0])
}

// Ensure all subscribers receive all messages sent out
// No subscribers unsubscribe during message broadcast/fan out
func TestSimpleDataSend(t *testing.T) {
	c := make(chan SocketData)
	broadcaster := NewBroadcaster(c)
	const numberOfSubs int32 = 100
	subs, _ := createSubscribers(t, broadcaster, numberOfSubs)
	subscriberMessages := make([]int32, numberOfSubs)
	var wg sync.WaitGroup
	for i := range subs {
		index := i
		go func() {
			wg.Add(1)
			subscriberMessages[index] = subscriberRead(t, subs[index])
			wg.Done()
		}()
	}
	const numberOfMessages int32 = 10
	sendData(c, numberOfMessages)
	close(c)
	wg.Wait()
	expectSubscribersSynced(t, numberOfMessages, subscriberMessages)
}

// Ensure no blocking when subscriber unsubs during message broadcast
func TestUnsubDataSend(t *testing.T) {
	c := make(chan SocketData)
	broadcaster := NewBroadcaster(c)
	// First will listen
	// Second will unsubscribe
	const numberOfSubs int32 = 2
	subs, _ := createSubscribers(t, broadcaster, numberOfSubs)
	subscriberMessages := make([]int32, 1)
	var wg sync.WaitGroup
	// Forced block on broadcaster since not all subscribers are listening
	go func() {
		wg.Add(1)
		subscriberMessages[0] = subscriberRead(t, subs[0])
		wg.Done()
	}()
	sendData(c, 1)
	// Data has already been received by broadcaster, unlock fan-out
	broadcaster.Unsubscribe(subs[1])
	sendData(c, 1)
	close(c)
	wg.Wait()
	expectSubscribersSynced(t, 2, subscriberMessages)
}

// Testing utility functions below

func expectSubscribersSynced(t *testing.T, expectedMessages int32, messages []int32) {
	for i := range messages {
		if messages[i] != expectedMessages {
			t.Errorf("Expected messages: %d, Subscriber[%d] Received: %d\n", expectedMessages, i, messages[i])
		}
	}
}

// Responds with the number of messages read
func subscriberRead(t *testing.T, s *Subscriber) int32 {
	var messagesReceived int32
	for {
		select {
		case <-s.SubChan():
			messagesReceived++
		case <-s.UnsubChan():
			return messagesReceived
		}
	}
}

// Return subscriber slice with requested number of subscribers
func createSubscribers(t *testing.T, b *Broadcaster, reqSubs int32) ([]*Subscriber, error) {
	subscriberList := []*Subscriber{}
	for i := 0; int32(i) < reqSubs; i++ {
		sub, err := b.Subscribe()
		if err != nil {
			return []*Subscriber{}, err
		}
		subscriberList = append(subscriberList, sub)
	}
	return subscriberList, nil
}

// Sends data to broadcaster channel
// Blocking operation
func sendData(c chan SocketData, numberOfTimes int32) {
	for i := 0; int32(i) < numberOfTimes; i++ {
		c <- SocketData{}
	}
}

// Close broadcaster channel
// Waits until all subscribers have been removed
func closeAwaitExpired(c chan SocketData, b *Broadcaster) {
	close(c)
	for {
		if b.Expired() {
			break
		}
	}
}

// Expected unsubcribe behavior:
// SubChan set to nil
// UnsubChan closed
func expectUnsubscribed(t *testing.T, s *Subscriber) {
	select {
	case <-s.UnsubChan():
	default:
		t.Error("Subscriber has not been unsubscribed")
	}
}

func expectPoolSize(t *testing.T, b *Broadcaster, expected int32) {
	if poolSize := b.PoolSize(); int32(poolSize) != expected {
		t.Errorf("Expected Poolsize: %d, Actual: %d\n", expected, poolSize)
	}
}

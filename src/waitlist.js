'use strict';

class WaitlistNode {
  constructor(person) {
    this.person = person;
    this.next = null;
  }
}

// A linked-list queue keeps FIFO operations constant-time without arrays.
class WaitlistQueue {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  enqueue(person) {
    const node = new WaitlistNode(person);

    if (this.tail) {
      this.tail.next = node;
    } else {
      this.head = node;
    }

    this.tail = node;
    this.length += 1;
    return person;
  }

  dequeue() {
    if (!this.head) {
      return null;
    }

    const person = this.head.person;
    this.head = this.head.next;
    this.length -= 1;

    if (!this.head) {
      this.tail = null;
    }

    return person;
  }

  peek() {
    return this.head ? this.head.person : null;
  }

  isEmpty() {
    return this.head === null;
  }
}

module.exports = { WaitlistQueue };

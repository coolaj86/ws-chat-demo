WebSocket / Long-Poll Demo (Angular & Node.js)
==========================

This is an example of writing a chat server with both WebSocket and Long-Poll clients.

The reason for including long-polling is simply because I'm working with someone who is dead-set
on supporting MSIE < 10.

The reason for not using Socket.IO is also simple:
It has so many features and transports that I wouldn't know how to debug it.

Either someone is stuck in the 90s or they're not (and we were able to agree on this).
We don't care for supporting flash and iFrames and progress events, etc - if they have
an old crappy browser they can have a crappier experience.


Setup
=====

Get the repo and install the deps.

```bash
git clone git@github.com:coolaj86/ws-chat-demo.git
pushd ws-chat-demo/

npm install
bower install

npm install -g jade
jade app/views/*.jade
```

Now run the demo:

```bash
node bin/server-runner 8080
```

And open it in a few browsers:

<http://local.foobar3000.com:8080/>

Philosophy
======

In talking with colleagues (and from my own experience) it seems that the best practice for
websockets is to broadcast to subscribers, not to move traditional RESTful logic to websockets.

You should still POST your updates.

Subscribers get instant updates on the live stream.

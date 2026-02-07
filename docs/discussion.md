# Discussion Integration Guide (Frontend)

This feature allows users to chat in real-time on a specific Hackathon
page. It uses REST API to load history and Socket.io for live updates.

## 1. Load Chat History (On Page Load)

Call this API when the user opens the Hackathon details page to show
past messages.

-   Endpoint: `GET /api/hackathons/:hackathonId/discussion`
-   Auth: Required (Bearer Token)

### UI Logic for parentId

The response contains a flat list of messages. You must organize them in
your UI:

-   If `parentId` is `null`: Display this as a Main Comment.
-   If `parentId` exists: Display this as a Reply nested under the
    message with that ID.

### Response Example

``` json
[
  {
    "_id": "msg_1",
    "message": "Is anyone working on the backend?",
    "parentId": null,
    "senderId": { "fullName": "Alice", "email": "alice@test.com" }
  },
  {
    "_id": "msg_2",
    "message": "Yes, I am.",
    "parentId": "msg_1",
    "senderId": { "fullName": "Bob", "email": "bob@test.com" }
  }
]
```

------------------------------------------------------------------------

## 2. Real-Time Chat (Socket.io)

### A. Connection

Connect to the server using the user's JWT token.

``` javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: "USER_JWT_TOKEN" }
});
```

### B. Join Room (Important)

You must emit this event immediately after connecting, or the user will
not receive messages for this specific hackathon.

``` javascript
socket.emit('join_hackathon', { 
  hackathonId: "current_hackathon_id" 
});
```

### C. Send a Message

Trigger this when the user clicks "Send".

-   To send a Main Comment: set `parentId` to `null`.
-   To send a Reply: set `parentId` to the `_id` of the comment being
    replied to.

``` javascript
socket.emit('send_message', { 
  hackathonId: "current_hackathon_id",
  message: "I can help with the design!",
  parentId: null
});
```

### D. Receive New Messages

Listen for this event to update the UI instantly without refreshing.

``` javascript
socket.on('receive_message', (newMessage) => {
  updateUI(newMessage);
});
```

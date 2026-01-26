import Discussion from '../models/discussion.model.js';

/*
  Functionality: Chat Socket Handler
  Manages real-time events for hackathon discussions.
  
  Events:
  - join_hackathon: User enters a specific hackathon's chat room.
  - send_message: User posts a comment or reply.
*/
export default (io, socket) => {
  
  /*
    Event: join_hackathon
    Input: { hackathonId }
    Effect: Adds the user's socket to a specific room so they receive relevant messages.
  */
  socket.on('join_hackathon', ({ hackathonId }) => {
    if (!hackathonId) return;
    const room = `hackathon_${hackathonId}`;
    socket.join(room);
    console.log(`User ${socket.user.fullName} joined discussion for ${hackathonId}`);
  });

  /*
    Event: send_message
    Input: { hackathonId, message, parentId (optional) }
    Effect: Saves message to DB and broadcasts it to everyone in the room.
  */
  socket.on('send_message', async ({ hackathonId, message, parentId }) => {
    if (!hackathonId || !message) return;

    try {
      // Create the comment or reply in the database
      const newDiscussion = await Discussion.create({
        hackathonId,
        senderId: socket.user._id,
        message,
        parentId: parentId || null, 
      });

      // Populate sender details so the UI can display names immediately
      await newDiscussion.populate('senderId', 'fullName email');

      // Broadcast the new message to all users in this hackathon's room
      const room = `hackathon_${hackathonId}`;
      io.to(room).emit('receive_message', newDiscussion);

    } catch (error) {
      console.error('Socket Message Error:', error);
      socket.emit('error', { message: 'Failed to post comment' });
    }
  });
};
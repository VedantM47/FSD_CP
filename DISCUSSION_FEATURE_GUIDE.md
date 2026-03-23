# Discussion Feature - Frontend Implementation

## Overview

The discussion feature allows hackathon participants to engage in real-time conversations within each hackathon. It's built using Socket.IO for real-time communication and follows the existing project structure and UI patterns.

## Architecture

### File Structure

```
src/client/src/
├── components/
│   └── common/
│       ├── DiscussionPanel.jsx       # Main discussion component
│       └── DiscussionLink.jsx        # Link to discussion page
├── pages/
│   └── hackathon/
│       └── Discussion.jsx            # Full-page discussion view
├── services/
│   └── socket.js                     # Socket.IO service (updated)
├── styles/
│   ├── discussion.css               # Panel styles
│   └── discussion-page.css          # Page styles
└── App.jsx                          # Routes (updated)
```

## Components

### 1. DiscussionPanel.jsx
**Location:** `src/client/src/components/common/DiscussionPanel.jsx`

Reusable component for displaying discussions. Can be embedded in any hackathon page.

**Props:**
- `hackathonId` (string, required): The hackathon ID for the discussion room
- `currentUser` (object, required): Current user data with `_id` and `fullName`

**Features:**
- Real-time message display with auto-scroll
- User avatars with initials
- Timestamp and date grouping
- Send message functionality
- Message animations

**Usage:**
```jsx
import DiscussionPanel from '../../components/common/DiscussionPanel';

<DiscussionPanel 
  hackathonId={hackathonId}
  currentUser={currentUser}
/>
```

### 2. DiscussionLink.jsx
**Location:** `src/client/src/components/common/DiscussionLink.jsx`

Navigation link to the full discussion page.

**Props:**
- `hackathonId` (string, required): The hackathon ID
- `className` (string, optional): Additional CSS classes

**Usage:**
```jsx
import DiscussionLink from '../../components/common/DiscussionLink';

<DiscussionLink hackathonId={hackathonId} />
```

### 3. Discussion (Page)
**Location:** `src/client/src/pages/hackathon/Discussion.jsx`

Full-page view for discussions with sidebar showing hackathon information.

**Route:** `/hackathon/:id/discussion`

**Features:**
- Hackathon information sidebar
- Quick stats (teams, participants)
- Responsive layout
- Loading and error states

## Services

### socket.js
**Location:** `src/client/src/services/socket.js`

Enhanced Socket.IO service with discussion-specific methods.

**Functions:**
```javascript
// Get or create socket instance
getSocket() → Socket

// Join hackathon discussion room
joinHackathonRoom(hackathonId: string) → void

// Send a message
sendMessage(hackathonId: string, message: string, parentId?: string) → void

// Listen for incoming messages
onReceiveMessage(callback: function) → void

// Stop listening for messages
offReceiveMessage(callback: function) → void
```

## Styling

### discussion.css
**Location:** `src/client/src/styles/discussion.css`

Styles for the DiscussionPanel component:
- Message container with auto-scroll
- Date dividers
- User avatars (initials in gradient circles)
- Message bubbles (different colors for own/other messages)
- Input form with send button
- Responsive design for mobile

**Key Classes:**
- `.discussion-panel` - Main container
- `.discussion-messages` - Messages container
- `.discussion-message` - Individual message
- `.message-content` - Message bubble
- `.discussion-input-form` - Input area

### discussion-page.css
**Location:** `src/client/src/styles/discussion-page.css`

Styles for the Discussion page:
- Two-column layout (sidebar + main)
- Hackathon info sidebar with stats
- Loading spinner and error states
- Responsive grid layout

**Key Classes:**
- `.discussion-page-wrapper` - Page wrapper
- `.discussion-sidebar` - Info sidebar
- `.discussion-main` - Main content area
- `.sidebar-card` - Sidebar card sections
- `.stats-grid` - Stats grid layout

## Routes

### App.jsx Updates

Added route in protected routes section:
```jsx
<Route path="/hackathon/:id/discussion" element={<Discussion />} />
```

The route is protected and requires authentication.

## Socket Events

### Backend Events

**Emit:**
- `join_hackathon` - Join a hackathon discussion room
- `send_message` - Send a message

**Listen:**
- `receive_message` - Receive new messages from other users
- `error` - Socket errors

### Example Usage

```javascript
import { joinHackathonRoom, sendMessage, onReceiveMessage } from '../../services/socket';

// Join room when component mounts
useEffect(() => {
  joinHackathonRoom(hackathonId);
  
  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };
  
  onReceiveMessage(handleNewMessage);
  
  return () => {
    offReceiveMessage(handleNewMessage);
  };
}, [hackathonId]);

// Send a message
const handleSend = (messageText) => {
  sendMessage(hackathonId, messageText);
};
```

## Authentication

The discussion feature uses Socket.IO authentication:
1. Token is retrieved from localStorage
2. Passed to socket connection via `auth` object
3. Backend validates token using middleware

**Token Flow:**
```
Frontend: getAuthToken() from localStorage
    ↓
Socket: socket.auth.token
    ↓
Backend: socketAuth middleware verifies JWT
    ↓
Socket: socket.user attached with user data
```

## Database Models

The backend uses a Discussion model:
```javascript
{
  hackathonId: ObjectId (ref: Hackathon),
  senderId: ObjectId (ref: User),
  message: String,
  parentId: ObjectId (ref: Discussion, for nested replies),
  type: String (enum: ['text', 'announcement']),
  timestamps: true
}
```

## Responsive Design

All components are fully responsive:

**Breakpoints:**
- Desktop: Full layout with sidebar
- Tablet (768px): Single column, sidebar above
- Mobile (480px): Optimized touch UX, smaller fonts

## Styling Philosophy

The discussion feature follows the existing project's design system:
- **Colors:** Blue gradients (#3B82F6), Gray scales (#F1F5F9, #E2E8F0)
- **Spacing:** 8px, 12px, 16px, 20px, 24px increments
- **Typography:** Inter font family, 0.875-2rem sizes
- **Shadows:** Consistent elevation shadows
- **Animations:** Smooth fadein, focus states, hover effects

## Integration Examples

### Adding Discussion to SingleHackathon Page

```jsx
import DiscussionLink from '../../components/common/DiscussionLink';

// In the component
<DiscussionLink hackathonId={hackathonId} className="my-custom-class" />

// Or embed the panel directly
<DiscussionPanel 
  hackathonId={hackathonId}
  currentUser={currentUser}
/>
```

### Adding to Navbar

```jsx
<Link to={`/hackathon/${hackathonId}/discussion`}>
  <ChatIcon /> Discussion
</Link>
```

## Performance Considerations

1. **Socket Connection:** Lazy initialized on first use
2. **Message Scrolling:** Virtual scrolling can be added for large message lists
3. **Debouncing:** Input can be debounced for rapid typing
4. **Memory:** Cleanup listeners on component unmount

## Testing

### Manual Testing Steps

1. **Setup:**
   - Ensure backend is running on port 8080
   - Frontend on port 5173
   - User is authenticated

2. **Test Discussion Page:**
   ```
   Navigate to /hackathon/{id}/discussion
   Should see: Hackathon info sidebar + discussion panel
   ```

3. **Test Real-Time Messaging:**
   - Open two browser windows (different users if possible)
   - Send message in one window
   - Verify it appears in other window

4. **Test Responsive:**
   - Open DevTools
   - Test at different breakpoints
   - Verify sidebar collapses on mobile

## Future Enhancements

1. **Nested Replies:** Support parentId for nested discussion threads
2. **User Mentions:** @username mentions with notifications
3. **Message Editing:** Edit/delete messages
4. **Typing Indicators:** Show when users are typing
5. **Message Search:** Search discussion history
6. **Pinned Messages:** Pin important messages
7. **Moderation:** Admin tools to moderate discussions
8. **Message Reactions:** Emoji reactions to messages
9. **File Sharing:** Share files/images in discussions
10. **Export Discussions:** Download discussion transcripts

## Troubleshooting

### Socket Not Connecting

**Issue:** Messages don't send or receive
**Solution:**
```javascript
// Check token
console.log(getAuthToken());

// Check socket connection
const socket = getSocket();
console.log(socket.connected);

// Check console for errors
```

### Messages Not Appearing

**Issue:** Sent messages don't appear
**Solution:**
1. Verify hackathonId is correct
2. Check backend console for errors
3. Verify room join was successful
4. Check Network tab in DevTools

### Styling Issues

**Issue:** Styles not applying
**Solution:**
1. Clear browser cache
2. Ensure CSS files are imported
3. Check CSS specificity
4. Verify class names match

## Deployment Checklist

- [ ] Backend socket.io running
- [ ] Frontend environment variables set
- [ ] CSS files imported in main App.jsx
- [ ] Routes registered in App.jsx
- [ ] Socket service initialized properly
- [ ] Auth token passing correctly
- [ ] Responsive tested on mobile devices
- [ ] Test messages sending between users
- [ ] Error handling tested
- [ ] Performance tested with multiple messages

## Support

For issues or questions:
1. Check this documentation
2. Review example files
3. Check browser console for errors
4. Check backend logs
5. Test with simplified example

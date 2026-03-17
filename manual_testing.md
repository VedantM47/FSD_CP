# Manual Testing Guide: Notification & Calendar

This guide explains how to test the Notification and Calendar features using `curl` or an API client like Postman.

## Pre-requisites
1.  **Server Running**: Ensure the server is running (`npm run dev`).
2.  **Environment Variables**: Ensure `.env` is configured (I've already set up a default one).

---

## 1. Authentication
Most features require a JWT token.

### Register a User
```bash
curl -X POST http://localhost:8080/api/users/register \
-H "Content-Type: application/json" \
-d '{
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "Password123"
}'
```
*Save the `token` from the response.*

---

## 2. Calendar Testing

### Get Personalized Calendar
```bash
curl -X GET http://localhost:8080/api/calendar \
-H "Authorization: Bearer <YOUR_TOKEN>"
```

### Verification Points:
- Check if hackathon dates (start, end, registration) appear.
- If you are a participant, check if prototype/final deadlines appear.
- Test the **"High Risk"** flag: Create a hackathon with a deadline within the next 24 hours. The response should show `isHighRisk: true` for that event.

---

## 3. Notification Testing

### Get Notifications
```bash
curl -X GET http://localhost:8080/api/notifications \
-H "Authorization: Bearer <YOUR_TOKEN>"
```

### Mark as Read
```bash
curl -X PATCH http://localhost:8080/api/notifications/<NOTIFICATION_ID>/read \
-H "Authorization: Bearer <YOUR_TOKEN>"
```

### Trigger Reminders (Admin Only)
*This requires an admin account or manually updating your role in the database.*

```bash
curl -X POST http://localhost:8080/api/notifications/trigger \
-H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Verification Points:
- Running the `trigger` endpoint should generate notifications for upcoming deadlines.
- Check if notifications are deleted or marked as read correctly.
- Ensure only admins can access the `/trigger` endpoint.

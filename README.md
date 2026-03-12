# Real Time News Platform

A full-stack news broadcasting platform

> Demonstrate Firebase Cloud Messaging (FCM) integration.

## Features

1. Admin Panel

- User management — view all users, their subscriptions and token status
- Topic management — create/delete topics
- News management - create/edit/delete news
- Send Notification to single user, topic or all user
- Schedule notifications (E.g. At 12 PM particular news article release on this channel)
- View notification history & delivery stats
- See which tokens are active/dead
- Manual Token refresh

2. User Panel (for now user can only view news )

- User authentication to tie token to users
- Subscribe/unsubscribe to topics (Sports, Tech, Finance, etc.)
- Notification Preferences Settings (mute/unmute, time period)
- Click Action -- redirect to relavent news page
- Notification inbox — users can see past notifications even if they missed the push

3. Background / System

- Auto token refresh (`onTokenRefresh`)
- Dead token cleanup on send failure
- Retry mechanism — auto retry failed notifications

## Future

- Email fallback — if push fails, send email instead
- Push analytics per news article — which article got most engagement
- Role-based admin access — super admin vs editor

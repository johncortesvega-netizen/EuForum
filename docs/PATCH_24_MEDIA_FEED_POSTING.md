# Patch 24 - Media Feed Front Door + Compact Anti-Spam Posting

## Goal

Start the user experience from the European media feed, then provide a small “Do you have a post?” composer that can send an original post into a selected forum room without making the user open the full forum first.

## Boundary

The media feed remains read-only. The compact composer does not create replies on news items, reposts, likes, copied headline floods, or engagement loops. It creates a normal forum thread in a selected room only after login, pause, and anti-spam checks.

## Frontend changes

- The app now renders the media feed tab on initial page load.
- The media feed tab contains a compact `Do you have a post?` composer.
- The compact composer asks for:
  - target room;
  - language;
  - thread title;
  - post contents;
  - pause/spam acknowledgment.
- The compact composer requires login before backend posting.
- The compact composer uses the same slow-posting meter as the main composer.
- The compact composer can preview Sydney Protocol clarity prompts locally, but the preview is not stored as a receipt, ranking signal, moderation action, or user profile.
- After successful posting, the user remains on the media feed front door and the recent-thread list updates.

## Backend changes

- Backend thread and reply creation now require a valid login token.
- Anonymous backend posting is blocked with `401`.
- Logged-in posting is server-side rate-limited:
  - maximum 3 posts per 30 minutes;
  - 45-second cooldown between posts;
  - duplicate content blocked for a short window.
- Posting events are stored only as minimal anti-spam control records: user id, thread id, post id, event type, content hash, and timestamp.

## Privacy / non-spam note

The anti-spam event table is not a feed-ranking system, ad profile, hidden trust score, or Sydney Protocol receipt store. It exists only to prevent flooding in the small-group forum test.

## Manual check

1. Open the app.
2. Confirm the first screen is the European media feed.
3. Confirm the compact “Do you have a post?” composer is visible.
4. Confirm posting is disabled until login and pause checkbox are present.
5. Register/login through the auth panel.
6. Create a post from the media feed composer and confirm it is placed into the selected room.
7. Try posting again immediately and confirm the backend returns a cooldown response.
8. Try direct anonymous backend posting and confirm it is blocked.

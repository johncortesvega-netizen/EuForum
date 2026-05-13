# European Media Feed

The public prototype includes a read-only European media feed in the Streamlit app.

## Purpose

Show recent headlines from European media outlets and newspapers without turning the forum into a comment section for those outlets.

## Implementation

- Feed sources are listed in `data/europeanMediaFeeds.json`.
- Streamlit loads RSS feeds server-side with `feedparser`.
- Results are cached for 10 minutes with `st.cache_data(ttl=600)`.
- A `Refresh RSS now` button clears the cache and reloads feeds.
- Each item shows:
  - title;
  - source;
  - published/updated timestamp when available;
  - short excerpt/summary when available;
  - `Open original` button.

## Reply Boundary

There are no replies, comments, quotes, likes, or forum threads attached to media-feed items.

If someone wants to read the full piece, share it, comment, subscribe, or follow the publisher's process, they must open the original article on the media outlet's own website or app.

## Current Starter Sources

- BBC News Europe
- France 24 Europe
- Deutsche Welle Europe
- The Guardian Europe
- POLITICO Europe

## Limitations

- RSS feed availability depends on each publisher.
- Some feeds may omit summaries or timestamps.
- Some publishers may change feed URLs.
- This prototype displays headlines/excerpts and links to originals; it does not republish full articles.
- This is not an endorsement/ranking system.

## Boundary

The media feed is read-only distribution awareness. Discussion, subscriptions, comments, and publisher-specific actions belong on the original outlet.

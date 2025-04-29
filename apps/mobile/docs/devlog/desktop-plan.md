# Desktop App Plan

Mono repo layout.

1. Set up basic Tauri app (without monorepo setup)

- [ ] copy and paste sql
- [ ] set up proxy and test that can read / write to the sqlite database
- [ ] refactor out common logic for RSS feed to packages

2. Basic structure for podcast app (scroll snap of podcast, episodes at the side)

- [ ] Carousel like scroll in sidebar - instant loading
- [ ] Infinite scroll / tanstack virtualized list data fetching
- [ ] Add new podcast - animation using motion.dev
- [ ] Cleanly separate the data fetching and UI layer to avoid re-renders

3. Inbox

4. Managing downloads

- [ ] Use `upload` plugin for Tauri

5. Handling transcriptions

- [ ] `shell` plugin for running ffmpeg and chunking the audio data
- [ ] Send out to groq, parse with google generative AI
- [ ] Decide on whether worth to include node ~60MB as sidecar - can use AI?

6. Creating sync layer / online store (R2 to store the transcripts?)

7. Podcast / audio playback (less important)

- [ ] Access the local audio APIs (research)?

8. Podcast Index search integration

Eventually if we want we can serve queries from D1 (5GB static database)

- [ ] Create `@zsheng.app` mail account (check how to set up the forwarding)
- [ ] Initially, we just access the API directly

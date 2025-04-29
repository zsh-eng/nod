# Nod

## Motivation

Fix many of the annoyances of listening to podcasts on Spotify.

1. Extremely laggy to load podcasts / episodes
2. Changing from Wi-Fi to mobile data always causes the podcast to disconnect and continue to randomly pause even after switching full to mobile data

Add useful features for my podcast note-taking experience.

1. SponsorBlock - skip sponsor segments
2. Transcript - view the transcript of the episode
3. Notes - quickly take notes / highlight segments of the transcript which are automatically associated with the episode

Features to replicate from Spotify Podcasts:

1. Have an "inbox" of new episodes
2. Download episodes to listen offline
3. Set speed for podcast playback

Nice-to-haves:

1. Stream episodes as they come in
2. Search for specific episodes
3. Search for new podcasts (Podcast Index API?)
4. Light / dark theme
5. Desktop app and sync

## Learning

Because every project should teach you something.

1. Creating an Expo project
2. Working with RSS Feeds and podcasts.
   Handling partial feeds and RSS feeds which do and don't support Last-Modified headers.
3. Working with Whisper + Gemini Flash for transcription and SponsorBlock.
4. Basic text editing on mobile.
5. Audio player on mobile.

## Development Loop

For generating migrations:

```bash
npx drizzle-kit generate
```

Running the dev server on android:

1. Turn on USB debugging on the android device and connect to the laptop
2. Check if the device is present using `adb devices`
3. Run `pnpm expo start --tunnel` and include `--clear` if there are issues and you need to clear the cache.

Setting up the development build:

Because we're using `react-media-track-player` which has native code, we need to build the app for the specific platform.

Follow the instructions [here](https://docs.expo.dev/develop/development-builds/create-a-build/).

Note that you have to install Android SDK and update the ENV variables.

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH
```

Run the build using `npx expo run:android`.

NOTE: Only tried running the build for Android so far, I believe there are different instructions for the various modules (like Filesystem, Track Player) to setup for iOS.

NOTE: Avoid using Android emulator on laptop – it's really slow 
compared to testing on a real device.

### Building Application for Usage

Install `eas-cli` globally and login with `eas login`.

```shell
eas build --platform android --profile development --local
```

### Preview Build

```shell
eas build --platform android --profile development --local
```

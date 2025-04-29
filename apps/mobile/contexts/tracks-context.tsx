import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import TrackPlayer, {
  Capability,
  Event,
  State,
  Track,
  useTrackPlayerEvents,
} from 'react-native-track-player';

interface TracksContextType {
  isPlayerReady: boolean;
  currentTrack: Track | null;
  isPlaying: boolean;
  setupPlayer: () => Promise<void>;
  loadTrack: (track: Track) => Promise<void>;
  playTrack: (index: number) => Promise<void>;
  togglePlayback: () => Promise<void>;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  reset: () => Promise<void>;
}

const TracksContext = createContext<TracksContextType | undefined>(undefined);

export const TracksProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useTrackPlayerEvents([Event.PlaybackState], async (event) => {
    if (event.type !== Event.PlaybackState) {
      return;
    }

    const state = (await TrackPlayer.getPlaybackState()).state;
    console.log('PlaybackState', state);
    setIsPlaying(state === State.Playing);

    const track = await TrackPlayer.getActiveTrack();
    if (track) {
      console.log('PlaybackState: Setting current track', track);
      setCurrentTrack(track);
    } else {
      console.log('PlaybackState: No track');
    }
  });

  const setupPlayer = async (): Promise<void> => {
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
        compactCapabilities: [Capability.Play, Capability.Pause],
      });
      setIsPlayerReady(true);
    } catch (error) {
      const isSetupBefore =
        error instanceof Error &&
        error.message.includes('The player has already been initialized');

      if (isSetupBefore) {
        console.log('Player already setup');
        setIsPlayerReady(true);
      } else {
        console.error('Error setting up the player:', error);
        setTimeout(setupPlayer, 1000);
      }
    }
  };

  const loadTrack = async (track: Track): Promise<void> => {
    if (!isPlayerReady) {
      console.warn('Player not ready, cannot add tracks');
      return;
    }

    try {
      const queue = await TrackPlayer.getQueue();
      if (queue.length > 0) {
        await TrackPlayer.reset();
      }

      await TrackPlayer.load(track);
      const newQueue = await TrackPlayer.getQueue();

      if (newQueue.length === 0) {
        throw new Error('Failed to add tracks to queue');
      }
    } catch (error) {
      console.error('Error adding tracks:', error);
      throw error;
    }
  };

  const playTrack = async (index: number): Promise<void> => {
    if (!isPlayerReady) {
      console.warn('Player not ready, cannot play track');
      return;
    }

    try {
      const queue = await TrackPlayer.getQueue();
      if (queue.length <= index) {
        console.error(
          `No track exists at index ${index}. Queue length: ${queue.length}`
        );
        return;
      }

      console.log('playTrack', index);
      console.log('queue', queue);
      await TrackPlayer.skip(index);

      console.log('attempting to play');
      await TrackPlayer.play();
      console.log('played');
    } catch (error) {
      console.error('Error playing track:', error);
      throw error;
    }
  };

  const togglePlayback = async (): Promise<void> => {
    if (!isPlayerReady) return;
    const state = (await TrackPlayer.getPlaybackState()).state;
    if (state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const skipToNext = async (): Promise<void> => {
    if (!isPlayerReady) return;
    await TrackPlayer.skipToNext();
  };

  const skipToPrevious = async (): Promise<void> => {
    if (!isPlayerReady) return;
    await TrackPlayer.skipToPrevious();
  };

  const reset = async (): Promise<void> => {
    if (!isPlayerReady) return;
    await TrackPlayer.reset();
  };

  useEffect(() => {
    setupPlayer();

    return () => {
      TrackPlayer.reset();
    };
  }, []);

  return (
    <TracksContext.Provider
      value={{
        isPlayerReady,
        currentTrack,
        isPlaying,
        setupPlayer,
        loadTrack,
        playTrack,
        togglePlayback,
        skipToNext,
        skipToPrevious,
        reset,
      }}
    >
      {children}
    </TracksContext.Provider>
  );
};

export const useTracks = (): TracksContextType => {
  const context = useContext(TracksContext);
  if (context === undefined) {
    throw new Error('useTracks must be used within a TracksProvider');
  }
  return context;
};

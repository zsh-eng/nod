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
  addTracks: (tracks: Track[]) => Promise<void>;
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

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack !== null) {
      const track = await TrackPlayer.getTrack(event.nextTrack);
      setCurrentTrack(track || null);
    }
  });

  useTrackPlayerEvents([Event.PlaybackState], async (event) => {
    if (event.type === Event.PlaybackState) {
      const state = await TrackPlayer.getState();
      setIsPlaying(state === State.Playing);
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
      console.error('Error setting up the player:', error);
    }
  };

  const addTracks = async (tracks: Track[]): Promise<void> => {
    if (!isPlayerReady) return;
    await TrackPlayer.add(tracks);
  };

  const playTrack = async (index: number): Promise<void> => {
    if (!isPlayerReady) return;
    await TrackPlayer.skip(index);
    await TrackPlayer.play();
  };

  const togglePlayback = async (): Promise<void> => {
    if (!isPlayerReady) return;
    const state = await TrackPlayer.getState();
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
        addTracks,
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

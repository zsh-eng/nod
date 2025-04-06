import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTracks } from '@/contexts/tracks-context';
import { useProgress } from 'react-native-track-player';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

export const MediaPlayer: React.FC = () => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlayback,
    skipToNext,
    skipToPrevious
  } = useTracks();
  const progress = useProgress();

  if (!currentTrack) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressIndicator, 
            { 
              width: `${(progress.position / progress.duration) * 100}%` 
            }
          ]} 
        />
      </View>
      
      <View style={styles.content}>
        {currentTrack.artwork && (
          <Image source={{ uri: currentTrack.artwork.toString() }} style={styles.artwork} />
        )}
        
        <View style={styles.trackInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>
        
        <View style={styles.controls}>
          <TouchableOpacity onPress={skipToPrevious}>
            <Ionicons name="play-skip-back" size={24} color="#000" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={28} 
              color="#000" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={skipToNext}>
            <Ionicons name="play-skip-forward" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.timeContainer}>
        <Text style={styles.time}>{formatTime(progress.position)}</Text>
        <Text style={styles.time}>{formatTime(progress.duration)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12
  },
  trackInfo: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000'
  },
  artist: {
    fontSize: 14,
    color: '#888',
    marginTop: 2
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8
  },
  progressBar: {
    height: 2,
    backgroundColor: '#eee',
    marginBottom: 10
  },
  progressIndicator: {
    height: '100%',
    backgroundColor: '#000'
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  time: {
    fontSize: 12,
    color: '#888'
  }
}); 
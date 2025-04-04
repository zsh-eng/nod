import { FlatList, StyleSheet } from 'react-native';
import { Podcast } from '../db/schema';
import { PodcastCard } from './podcast-card';

interface PodcastListProps {
  podcasts: Podcast[];
}

export function PodcastList({ podcasts }: PodcastListProps) {
  return (
    <FlatList
      data={podcasts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <PodcastCard podcast={item} />}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    width: '100%',
  },
});

import { Podcast } from '@/db/schema';
import { format } from 'date-fns';
import { Image, StyleSheet, Text, View } from 'react-native';

const formatDate = (date: Date) => {
  return format(date, 'd MMM yyyy');
};

export function PodcastCard({ podcast }: { podcast: Podcast }) {
  if (!podcast.imageUrl) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: podcast.imageUrl }}
        style={styles.image}
        resizeMode='cover'
      />

      <View style={styles.textContainer}>
        <Text style={styles.title}>{podcast.title}</Text>
        <Text style={styles.author}>{podcast.itunesAuthor}</Text>
        <Text style={styles.date}>
          Updated {formatDate(new Date(podcast.nodDateUpdated))}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    width: '100%',
    alignSelf: 'stretch',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  textContainer: {
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  author: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
});

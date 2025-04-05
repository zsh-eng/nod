import { H2, Paragraph, ScrollView, YStack } from 'tamagui';

export default function DownloadsPage() {
  return (
    <ScrollView>
      <YStack gap='$4' padding='$4' paddingVertical='$6'>
        <H2 fontWeight='bold'>Downloads</H2>
        <Paragraph>Your downloaded episodes will appear here.</Paragraph>
      </YStack>
    </ScrollView>
  );
}

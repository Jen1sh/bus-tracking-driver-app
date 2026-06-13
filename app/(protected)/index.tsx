import TripCard from '@/components/home/TripCard';
import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

const Home = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        <TripCard />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create(({ spacings }) => ({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: spacings.md,
  },
}));

export default Home;

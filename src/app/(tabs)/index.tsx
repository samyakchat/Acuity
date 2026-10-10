import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {useTheme} from '@/components/fatUI/theme';
import { AnimatedIcon } from '@/components/animated-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <AnimatedIcon />
          <ThemedText type="title" style={styles.title}>
            acuity base delete soon
          </ThemedText>
        </ThemedView>

        

        <Button title="seen it game finished" onPress={() => 
            router.push({
              pathname: '/gamePages/gametemp', 
              params: {gameID: "seenIt-10987", primaryColor: theme.primary} 
            })} 
          />
        <Button title="example" onPress={() => router.navigate('/(auth)/intro')} />


      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },

});

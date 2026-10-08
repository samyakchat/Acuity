import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from 'expo-router';
import {useTheme} from '@/components/fatUI/theme';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useFonts, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold,} from '@expo-google-fonts/nunito';
import { Header } from '@react-navigation/elements';

export default function RootLayout() {
  const theme = useTheme();
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider
      value={theme.isDark ? DarkTheme : DefaultTheme}
    >
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <AnimatedSplashOverlay />
    </ThemeProvider>
  );
}
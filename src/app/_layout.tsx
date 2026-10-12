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
import {AuthProvider, useAuth} from '@/components/authprovider';



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
      <AuthProvider>
        <RootNavigator/>
      </AuthProvider>
      <AnimatedSplashOverlay />
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { loading, role } = useAuth();
  if (loading) return null;   
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Protected guard={!role}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={role==="patient"}>
        <Stack.Screen name="(patient)" />
      </Stack.Protected>
      <Stack.Protected guard={role==="caretaker"}>
        <Stack.Screen name="(caretaker)" />
      </Stack.Protected>
    </Stack>
  );    
}
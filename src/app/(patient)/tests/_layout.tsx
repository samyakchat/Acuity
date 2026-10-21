
import { Stack } from 'expo-router';

export default function TestPages() {
  return <Stack 
    screenOptions={{ 
      headerShown: false, 
      gestureEnabled: false
    }} />;
}
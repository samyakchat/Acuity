import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FatButton from '@/components/fatUI/fatButton';
import { useTheme } from '@/components/fatUI/theme';
import { FONT } from '@/components/fatUI/theme';
import FatHeader from '@/components/fatUI/fatHeader';
import {useRouter} from 'expo-router';
import { Image } from 'expo-image';

type Props = {
  onLogin: (username: string, password: string) => Promise<void>;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
};

export default function LoginScreen({ onLogin, onOpenPrivacy, onOpenTerms }: Props) {

  const theme = useTheme();
  const router = useRouter();
  
  function leadToPage(url: string) {
    router.navigate(url as any);
  }



  return (
    
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
    
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FatHeader/>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          <View style={styles.header}>   
                <Text style={[styles.title, {color: theme.text}]} accessibilityRole="header">
                  Meet Mochi!
                </Text>
                <Text style={[styles.subtitle, {color: theme.textSoft}]}>Acuity's smartest Axolotl</Text>
              </View>
            <View style={{ gap: 16, marginTop: 26 }}>
                <Image source={require('@/assets/mochi_stale/mochi_front_happy.svg')} 
                    style={{ width: 210, height: 300, alignSelf: 'center', objectFit: 'contain' }} 
                />
            </View>
          <View style={styles.column}>
            <View style={{ gap: 16, bottom: 16 }}>
              <FatButton text="JOIN NOW" type="primary" onPress={() => {leadToPage("/signup")}} size='small'/>
              <FatButton text="IM ALREADY A MEMBER" type="secondary" onPress={() => {leadToPage("/login")}} size='small'/>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1},
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 32 },
  column: { width: '100%', maxWidth: 480, alignSelf: 'center', gap: 28, justifyContent: 'flex-end', flex: 1 },

  header: { alignItems: 'center', gap: 10, marginTop: 32 },
  title: {
    fontFamily: FONT.title,
    fontSize: 40,
    lineHeight: 48,
    textAlign: 'center',

  },
  subtitle: {
    fontFamily: FONT.body,
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'center',
  },

});
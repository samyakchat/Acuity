import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CircleAlert,
  FileText,
  Lock,
  LogIn,
  ShieldCheck,
  User,
} from 'lucide-react-native';
import FatButton from '@/components/fatUI/fatButton';
import FatInput from '@/components/fatUI/fatInput';
import { useTheme } from '@/components/fatUI/theme';
import { FONT } from '@/components/fatUI/theme';
import FatHeader from '@/components/fatUI/fatHeader';

type Props = {
  onLogin: (username: string, password: string) => Promise<void>;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
};

export default function LoginScreen({ onLogin, onOpenPrivacy, onOpenTerms }: Props) {

  const theme = useTheme();


  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordRef = useRef<TextInput>(null);
  const shakeX = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence(
      [10, -10, 8, -8, 4, 0].map((toValue) =>
        Animated.timing(shakeX, { toValue, duration: 55, useNativeDriver: true }),
      ),
    ).start();
  };

  const fail = (message: string) => {
    setError(message);
    AccessibilityInfo.announceForAccessibility(message);
    shake();
  };

  const submit = async () => {
    if (loading) return;
    if (!username.trim() || !password) {
      fail('Please enter your username and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onLogin(username.trim(), password);
    } catch {
      fail("That username or password isn't right. Please check them and try again.");
    } finally {
      setLoading(false);
    }
  };


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
          <View style={styles.column}>
              <View style={styles.header}>
                
                <Text style={[styles.title, {color: theme.text}]} accessibilityRole="header">
                  Welcome back
                </Text>
                <Text style={[styles.subtitle, {color: theme.textSoft}]}>Sign in as a caretaker or patient</Text>
              </View>

            {/* Form */}
              <Animated.View style={{ gap: 20, transform: [{ translateX: shakeX }] }}>
                <FatInput 
                    label="Username"
                    icon={User} 
                    value={username} 
                    onChangeText={setUsername}
                    autoCapitalize="none" 
                    autoComplete="username" 
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()} 
                    size='small'
                />
                <FatInput 
                    ref={passwordRef} 
                    label="Password" 
                    icon={Lock} 
                    type="password"
                    value={password} 
                    onChangeText={setPassword} 
                    onSubmitEditing={submit}
                    size='small'
                />
                    

                {error && (
                  <View style={[styles.errorBox, {backgroundColor: theme.errorTint, borderColor: theme.error}]} accessibilityRole="alert" accessibilityLiveRegion="polite">
                    <CircleAlert size={28} color={theme.error} strokeWidth={2.5} />
                    <Text style={[styles.errorText, {color: theme.error}]}>{error}</Text>
                  </View>
                )}
              </Animated.View>

              <FatButton text="Log in" icon={LogIn} type="primary" onPress={submit} loading={loading} loadingText="Logging in…" size='small'/>


              <View style={styles.policyRow}>
                <FatButton text="Privacy Policy" 
                    icon={ShieldCheck} 
                    type="secondary" 
                    size="small" 
                    onPress={onOpenPrivacy} 
                />

                <FatButton
                  text="Our Terms"
                  icon={FileText}
                  type="secondary"
                  size="small"
                  onPress={onOpenTerms}
                  style={{ flex: 1 }}
                />
         
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
  column: { width: '100%', maxWidth: 480, alignSelf: 'center', gap: 28 },

  header: { alignItems: 'center', gap: 10, marginBottom: 32 },
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

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
  },
  errorText: { flex: 1, fontFamily: FONT.bold, fontSize: 18, lineHeight: 25 },
  policyRow: { flexDirection: 'row', gap: 14 },
});
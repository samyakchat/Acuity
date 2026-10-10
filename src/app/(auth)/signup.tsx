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
  AtSign
} from 'lucide-react-native';
import FatButton from '@/components/fatUI/fatButton';
import FatInput from '@/components/fatUI/fatInput';
import { useTheme } from '@/components/fatUI/theme';
import { FONT } from '@/components/fatUI/theme';
import FatHeader from '@/components/fatUI/fatHeader';
import { supabase } from '@/lib/supabase';




type Props = {
  onLogin: (username: string, password: string) => Promise<void>;

};

export default function LoginScreen({ onLogin}: Props) {

  const theme = useTheme();
  const [role, setRole] = useState<'caretaker' | 'patient' | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passconfirm, setPassconfirm] = useState('');
  const [fullname, setFullName] = useState('');
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
    if (!role) {
      fail('Please select a role.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
        email: username.trim(),
        password: password,
        options: {
          data: {
            role: role,
            full_name: fullname
          }

        }

    });
    setLoading(false);
    if (error) {
        fail(error.message);
        console.log(error.message)
        return;
    }

    alert("Thank you for joining Acuity!");
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
                  Hey there!
                </Text>
                <Text style={[styles.subtitle, {color: theme.textSoft}]}>If you have no caretaker, pick Patient.</Text>
              </View>

              <Animated.View style={{ gap: 20, transform: [{ translateX: shakeX }] }}>
                <FatInput 
                    label="Email"
                    icon={AtSign} 
                    value={username} 
                    onChangeText={setUsername}
                    autoCapitalize="none" 
                    autoComplete="email" 
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
                    size="small"
                />


                <FatInput
                    label="Full Name"
                    icon={User}
                    value={fullname}
                    onChangeText={setFullName}
                    size="small"
                />

                    

                {error && (
                  <View style={[styles.errorBox, {backgroundColor: theme.errorTint, borderColor: theme.error}]} accessibilityRole="alert" accessibilityLiveRegion="polite">
                    <CircleAlert size={28} color={theme.error} strokeWidth={2.5} />
                    <Text style={[styles.errorText, {color: theme.error}]}>{error}</Text>
                  </View>
                )}
              </Animated.View>

              <View style={styles.policyRow}>
                <FatButton 
                    text="CARETAKER" 
                    type={role==="caretaker" ? "primary" : "secondary"} 
                    size="small" 
                    onPress={() => setRole('caretaker')} 
                    style={{ flex: 1, }}
         

                />

                <FatButton
                  text="THE PATIENT"
                  type={role==="patient" ? "primary" : "secondary"}
                  size="small"
                  onPress={() => setRole('patient')}
                  style={{ flex: 1, }}
                />


         
              </View>

              <FatButton text="JOIN NOW" icon={LogIn} type="primary" onPress={submit} loading={loading} loadingText="Logging in…" size='small'/>


            
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
  policyRow: { flexDirection: 'row', gap: 14, flex: 1 },
});
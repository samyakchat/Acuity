import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleAlert, Clock, KeyRound, RefreshCw } from 'lucide-react-native';
import { useAuth } from '@/components/authprovider';
import { pairingCode } from '@/lib/paircode';
import FatButton from '@/components/fatUI/fatButton';
import FatHeader from '@/components/fatUI/fatHeader';
import FatSwitch from '@/components/fatUI/fatSwitch';
import { useTheme, FONT } from '@/components/fatUI/theme';
import { supabase } from '@/lib/supabase';

export default function PairingPage() {
  const { role } = useAuth();
  const theme = useTheme();
  const [activeCodeID, setactivecodeid] = useState<string | null>(null);
  let isMounted = false
  const [expire, setIsExpire] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [giveOpt, setGiveOpt] = useState(false)

  const reveal = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0.94)).current;



  const playReveal = () => {
    reveal.setValue(0);
    pop.setValue(0.94);
    Animated.parallel([
      Animated.timing(reveal, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(pop, {
        toValue: 1,
        friction: 6,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();
  };

  async function sendRec() {
    if (loading) return;
    setError(null);
    setLoading(true);
    

    try {
      const generated = await pairingCode(role, expire);

      const value = String(generated ?? '');
      setCode(value);
      setGiveOpt(false);
      playReveal();

    } catch (e: any) {
      const message = e?.message ?? 'Could not create a code. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

    async function check() {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return userError ?? new Error("No authenticated user found.");
        }

        const { data, error } = await supabase
            .from('pairing_codes')
            .select("patient_id, expires_at, code, id")
            .eq('patient_id', user.id);

        if (error) {
            console.error("error getting the codes:", error);
            return null;
        }

        if (!data || data.length === 0) {
            return null;
        }

        const now = new Date();
        const permanentCode = data.find(row => row.expires_at === null);
        if (permanentCode) {
            setactivecodeid(permanentCode.id);
            return permanentCode.code;
        }
        const activeCode = data.find(row => {
            if (!row.expires_at) return false;
            return new Date(row.expires_at) > now;
        });
        
        if (activeCode) {
            setactivecodeid(activeCode.id)
            return activeCode.code;
        }
        return null;
    }

    async function callTodel() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
          return userError ?? new Error("No authenticated user found.");
      }

      console.log(activeCodeID)

      const { data, error } = await supabase
        .from('pairing_codes')
        .delete()
        .eq('id', activeCodeID);

        setError(error?.message as any)

        setCode(null);
        setactivecodeid(null);
        setGiveOpt(true);
        setError("Code deleted!")
    
    }



    useEffect(() => {
        isMounted = true;

        async function initializeCode() {
            const existingCode = await check();
            if (!isMounted) return;

            if (existingCode != null) {
                setCode(existingCode as string);
                setGiveOpt(false);
                playReveal();
            } else {
                setGiveOpt(true);
            }
        }
        initializeCode();

        return () => {
        isMounted = false;
        };
    }, []);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.column}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]} >
              Pair accounts
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSoft }]}>
              You are a patient. Give this code to your caretaker.
            </Text>
          </View>
        

        {giveOpt && (
            <View style={{gap: 32}}>
                <View style={[styles.optionRow, { backgroundColor: theme.background, borderColor: theme.secondaryEdge }]}>
                    <Clock size={28} color={theme.text} strokeWidth={2.5} />
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.optionTitle, { color: theme.text }]}>Expire the code</Text>
                        <Text style={[styles.optionHint, { color: theme.textSoft }]}>
                            {expire ? 'The code stops working after 30 minutes' : 'This is your only code valid forever'}
                        </Text>
                    </View>
                    <FatSwitch value={expire} onValueChange={setIsExpire} />
                </View>

                <FatButton
                    text={"Make me a code"}
                    icon={KeyRound}
                    type="primary"
                    size="small"
                    onPress={sendRec}
                    loading={loading}
                    loadingText="Making code…"
                />
            </View>
        )}


          

          {error && (
            <View
              style={[styles.errorBox, { backgroundColor: theme.errorTint, borderColor: theme.error }]}

            >
              <CircleAlert size={28} color={theme.error} strokeWidth={2.5} />
              <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
            </View>
          )}

          {code && (
            <Animated.View
              style={[styles.codeCard, {opacity: reveal, transform: [
                    { translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
                    { scale: pop },
                  ],
                },
              ]}
            >
              <Text style={[styles.codeLabel, { color: theme.textSoft }]}>Your code</Text>
              <Text style={[styles.code, { color: theme.text }]} selectable>
                {code}
              </Text>

              <FatButton
                text='Delete Code'
                size='small'
                type='primary'
                onPress={callTodel}
                style={{marginTop: 60}}
              />

            </Animated.View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 32 },
  column: { width: '100%', maxWidth: 480, alignSelf: 'center', gap: 28 },

  header: { alignItems: 'center', gap: 10, marginBottom: 8 },
  title: { fontFamily: FONT.title, fontSize: 40, lineHeight: 48, textAlign: 'center' },
  subtitle: { fontFamily: FONT.body, fontSize: 20, lineHeight: 28, textAlign: 'center' },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
  },
  optionTitle: { fontFamily: FONT.bold, fontSize: 20, lineHeight: 26 },
  optionHint: { fontFamily: FONT.body, fontSize: 16, lineHeight: 22 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
  },
  errorText: { flex: 1, fontFamily: FONT.bold, fontSize: 18, lineHeight: 25 },

  codeCard: {
    alignItems: 'center',
    gap: 12,
    padding: 24,
    borderRadius: 24,
  },
  codeLabel: { fontFamily: FONT.body, fontSize: 18, lineHeight: 24 },
  code: {
    fontFamily: FONT.title,
    fontSize: 48,
    lineHeight: 58,
    letterSpacing: 6,
    textAlign: 'center',
  },
  codeHint: { fontFamily: FONT.body, fontSize: 18, lineHeight: 26, textAlign: 'center' },
});
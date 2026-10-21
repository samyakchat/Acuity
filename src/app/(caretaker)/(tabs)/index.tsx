import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { ChevronRight, ClipboardList, KeyRound, LogOut, User, Users } from 'lucide-react-native';
import FatButton from '@/components/fatUI/fatButton';
import { useTheme, FONT } from '@/components/fatUI/theme';
import { supabase } from '@/lib/supabase';

/* Same staggered fade + rise as the pairing list */
function Enter({ index, children }: { index: number; children: React.ReactNode }) {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 260,
      delay: Math.min(index, 8) * 60,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });
  return <Animated.View style={{ opacity: enter, transform: [{ translateY }] }}>{children}</Animated.View>;
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

// HARDCODED: static copy for the "How it works" card
const STEPS = [
  { icon: KeyRound, title: 'Pair', body: 'Enter the code shown on your patient\'s device.' },
  { icon: ClipboardList, title: 'Review', body: 'See their starting baseline, area by area.' },
  { icon: Users, title: 'Follow along', body: 'Daily check-ins will show how they are doing over time.' },
];

export default function CaretakerHome() {
  const theme = useTheme();
  const press = useRef(new Animated.Value(1)).current;

  const [name, setName] = useState<string>('');
  const [count, setCount] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const full = (user.user_metadata?.full_name as string | undefined) ?? '';
      setName(full.trim().split(' ')[0] ?? '');

      const { count: c, error } = await supabase
        .from('caretaker_patients')
        .select('patient_id', { count: 'exact', head: true })
        .eq('caretaker_id', user.id);
      if (error) throw error;
      setCount(c ?? 0);
    } catch (e) {
      console.log(e);
    }
  }, []);

  // refresh the count whenever the caretaker comes back to this screen
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // HARDCODED: route to the pairing page. Change if your path differs.
  const goPatients = () => router.push('/pairingPage' as any);

  const pressTo = (v: number) =>
    Animated.spring(press, { toValue: v, friction: 6, tension: 140, useNativeDriver: true }).start();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.column}>
          <Enter index={0}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>
                {greeting()}
                {name ? `, ${name}` : ''}
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSoft }]}>Here's a quick look at your patients.</Text>
            </View>
          </Enter>

          <Enter index={1}>
            <View style={[styles.card, { backgroundColor: theme.fieldBg, borderColor: theme.line }]}>
              <Text style={[styles.cardTitle, { color: theme.primary }]}>2 out of {count} patients active today!</Text>
              <View style={styles.step}>
                  <User size={25} color={theme.textSoft} strokeWidth={2.5} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepTitle, { color: theme.textSoft }]}>Samyak Chatterjee</Text>
                  </View>
                </View>
              <View style={styles.step}>
                  <User size={25} color={theme.textSoft} strokeWidth={2.5} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepTitle, { color: theme.textSoft }]}>Gabi Thomas</Text>
                  </View>
                </View>
            </View>
          </Enter>

          <Enter index={2}>
            <View style={[styles.card, { backgroundColor: theme.fieldBg, borderColor: theme.line }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>How it works</Text>
              {STEPS.map((s) => (
                <View key={s.title} style={styles.step}>
                  <s.icon size={28} color={theme.primary} strokeWidth={2.5} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepTitle, { color: theme.text }]}>{s.title}</Text>
                    <Text style={[styles.stepBody, { color: theme.textSoft }]}>{s.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Enter>

          <Enter index={3}>
            <FatButton
              text="Log out"
              icon={LogOut}
              type="secondary"
              size="small"
              onPress={() => supabase.auth.signOut()}
            />
          </Enter>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  column: { width: '100%', maxWidth: 480, alignSelf: 'center', gap: 20 },

  header: { gap: 4, marginTop: 4 },
  title: { fontFamily: FONT.title, fontSize: 32, lineHeight: 36 },
  subtitle: { fontFamily: FONT.body, fontSize: 17, lineHeight: 24 },

  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 22,
    borderBottomWidth: 6,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  heroTitle: { fontFamily: FONT.heavy, fontSize: 24, lineHeight: 30, color: '#FFFFFF' },
  heroBody: { fontFamily: FONT.bold, fontSize: 17, lineHeight: 23, color: '#FFFFFF' },

  card: { borderRadius: 18, borderWidth: 2, padding: 16, gap: 16 },
  cardTitle: { fontFamily: FONT.bold, fontSize: 21, lineHeight: 27 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepTitle: { fontFamily: FONT.bold, fontSize: 18, lineHeight: 24 },
  stepBody: { fontFamily: FONT.body, fontSize: 16, lineHeight: 23 },
});
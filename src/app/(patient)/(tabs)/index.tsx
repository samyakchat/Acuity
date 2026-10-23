import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { CalendarCheck, ChevronRight, CircleAlert, CircleCheck, LogOut } from 'lucide-react-native';
import FatButton from '@/components/fatUI/fatButton';
import { useTheme, FONT } from '@/components/fatUI/theme';
import { supabase } from '@/lib/supabase';
import { checkAp, setAptitudeList } from '../tests/engine';
import { Image } from 'expo-image';

type DailyPlan = { date: string; list: string[] };

function MochiArt({ size = 150 }: { size?: number }) {
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  return (
    <Animated.View style={{ transform: [{ translateY }] }}>
      <Image
        source={require("@/assets/mochi_stale/mochi_coffee.svg")}
        style={{
          width: 210,
          height: 300,
          alignSelf: "center",
          objectFit: "contain",
        }}
      />
    </Animated.View>
  );
}

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

function formatListDate(raw: string) {
  const [y, m, d] = raw.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return raw;
  return new Date(y, m - 1, d + 1).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function PatientHome() {
  const theme = useTheme();
  const press = useRef(new Animated.Value(1)).current;
  const dailyPress = useRef(new Animated.Value(1)).current;

  const [name, setName] = useState('');
  const [passedApt, setPassedApt] = useState<boolean | null>(null); // null = still checking
  const [daily, setDaily] = useState<DailyPlan | null>(null); // latest list from supabase
  const [doneToday, setDoneToday] = useState(false); // a daily result already exists for today
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      setFailed(false);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const full = (user?.user_metadata?.full_name as string | undefined) ?? '';
      setName(full.trim().split(' ')[0] ?? '');

      const passed = await checkAp();
      setPassedApt(passed);

      if (passed && user) {
        // same query the renderer (gametemp) uses, so the card and the games always agree
        const { data, error } = await supabase
          .from('daily_lists')
          .select('list_date, data')
          .eq('patient_id', user.id)
          .order('list_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        const list = data?.data?.aptitudeList;
        setDaily(Array.isArray(list) && list.length > 0 ? { date: data!.list_date, list } : null);

        // already took it today? (local midnight to local midnight)
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const { count, error: resultsError } = await supabase
          .from('daily_results')
          .select('*', { count: 'exact', head: true })
          .eq('patient_id', user.id)
          .gte('taken_at', start.toISOString())
          .lt('taken_at', end.toISOString());

        if (resultsError) throw resultsError;
        setDoneToday((count ?? 0) > 0);
      }
    } catch (e) {
      console.log(e);
      setFailed(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function logout() {
    Alert.alert(
      "Are you sure you want to log out?",
      "You will have to sign back in, possibly with your caretaker",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: () => supabase.auth.signOut()
        },
        {
          text: "dev",
          onPress: () => setAptitudeList()
        }
      ],
      { cancelable: true }
    );
    
  }

  const startAptitude = () =>
    router.push({
      pathname: '/(patient)/gamePages/gametemp',
      params: { gameID: 'welcome' },
    });

  const startDaily = () => {
    if (!daily || doneToday) return;
    router.push({
      pathname: '/(patient)/gamePages/gametemp',
      params: { gameID: daily.list[0] },
    });
  };

  const pressTo = (anim: Animated.Value, v: number) =>
    Animated.spring(anim, { toValue: v, friction: 6, tension: 140, useNativeDriver: true }).start();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.column}>
          <Enter index={0}>
            <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: theme.text }]}>
                  {greeting()}
                  {name ? `, ${name}` : ''}
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSoft }]}></Text>
              </View>
              <FatButton
                icon={LogOut}
                type="secondary"
                size="small"
                onPress={() => logout()}
              />
            </View>
          </Enter>

          {failed ? (
            <View style={styles.emptyBox}>
              <CircleAlert size={32} color={theme.error} strokeWidth={2.5} />
              <Text style={[styles.emptyText, { color: theme.error }]}>We couldn't load your page.</Text>
              <FatButton
                text="Try again"
                type="secondary"
                size="small"
                onPress={load}
                style={{ alignSelf: 'stretch' }}
              />
            </View>
          ) : passedApt === null ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 24 }} />
          ) : !passedApt ? (
            /* First visit: one big, obvious thing to tap */
            <Enter index={1}>
              <Animated.View style={{ transform: [{ scale: press }] }}>
                <Pressable
                  onPress={startAptitude}
                  onPressIn={() => pressTo(press, 0.97)}
                  onPressOut={() => pressTo(press, 1)}
                  accessibilityRole="button"
                  accessibilityLabel="Start your first check-in with Mochi"
                  style={[styles.hero, { backgroundColor: theme.primary }]}
                >
                  <MochiArt />
                  <Text style={styles.heroTitle}>Meet Mochi</Text>
                  <Text style={styles.heroBody}>
                    A short first check-in helps Mochi get to know you. It only takes a few minutes.
                  </Text>
                  <View style={styles.heroPill}>
                    <Text style={[styles.heroPillText, { color: theme.primary }]}>Let's start</Text>
                    <ChevronRight size={24} color={theme.primary} strokeWidth={3} />
                  </View>
                </Pressable>
              </Animated.View>
            </Enter>
          ) : (
            <View style={{ gap: 10 }}>
              <Enter index={1}>
                <View style={styles.mochiRow}>
                  <MochiArt size={130} />
                </View>
              </Enter>

              {daily && doneToday ? (
                <Enter index={2}>
                  <View style={[styles.card, { backgroundColor: theme.fieldBg, borderColor: theme.line }]}>
                    <View style={styles.cardRow}>
                      <CircleCheck size={22} color={theme.primary} strokeWidth={2.5} />
                      <Text style={[styles.cardTitle, { color: theme.text }]}>Daily activity done</Text>
                    </View>
                    <Text style={[styles.cardBody, { color: theme.textSoft }]}>
                      Great work today! Come back tomorrow for the next one.
                    </Text>
                  </View>
                </Enter>
              ) : daily ? (
                <Enter index={2}>
                  <Animated.View style={{ transform: [{ scale: dailyPress }] }}>
                    <Pressable
                      onPress={startDaily}
                      onPressIn={() => pressTo(dailyPress, 0.97)}
                      onPressOut={() => pressTo(dailyPress, 1)}
                      accessibilityRole="button"
                      accessibilityLabel={`Start your daily activity for ${formatListDate(daily.date)}`}
                      style={[styles.hero, { backgroundColor: theme.primary }]}
                    >
                      <View style={styles.datePill}>
                        <CalendarCheck size={20} color="#FFFFFF" strokeWidth={2.5} />
                        <Text style={styles.datePillText}>{formatListDate(daily.date)}</Text>
                      </View>
                      <Text style={styles.heroTitle}>Your daily activity</Text>
                      <View style={styles.heroPill}>
                        <Text style={[styles.heroPillText, { color: theme.primary }]}>Let's go</Text>
                        <ChevronRight size={24} color={theme.primary} strokeWidth={3} />
                      </View>
                    </Pressable>
                  </Animated.View>
                </Enter>
              ) : (
                <Enter index={2}>
                  <View style={[styles.card, { backgroundColor: theme.fieldBg, borderColor: theme.line }]}>
                    <View style={styles.cardRow}>
                      <CalendarCheck size={22} color={theme.primary} strokeWidth={2.5} />
                      <Text style={[styles.cardTitle, { color: theme.text }]}>Daily activity</Text>
                    </View>
                    <Text style={[styles.cardBody, { color: theme.textSoft }]}>
                      Nothing is ready yet. Check back soon!
                    </Text>
                  </View>
                </Enter>
              )}

              <Enter index={3}>
                <View style={[styles.card, { backgroundColor: theme.fieldBg, borderColor: theme.line }]}>
                  <View style={styles.cardRow}>
                    <CircleCheck size={22} color={theme.primary} strokeWidth={2.5} />
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Introduction Activity Done</Text>
                  </View>
                  <Text style={[styles.cardBody, { color: theme.textSoft }]}>Mochi has gotten to learn you, thank you!</Text>
                </View>
              </Enter>
            </View>
          )}
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
    alignItems: 'center',
    gap: 12,
    padding: 24,
    borderRadius: 26,
    borderBottomWidth: 8,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  heroTitle: { fontFamily: FONT.title, fontSize: 30, lineHeight: 34, color: '#FFFFFF', textAlign: 'center' },
  heroBody: { fontFamily: FONT.bold, fontSize: 18, lineHeight: 25, color: '#FFFFFF', textAlign: 'center' },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  heroPillText: { fontFamily: FONT.heavy, fontSize: 20, lineHeight: 26 },

  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  datePillText: { fontFamily: FONT.bold, fontSize: 18, lineHeight: 24, color: '#FFFFFF' },

  mochiRow: { alignItems: 'center' },

  card: { borderRadius: 18, borderWidth: 2, padding: 16, gap: 8 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontFamily: FONT.bold, fontSize: 20, lineHeight: 26 },
  cardBody: { fontFamily: FONT.body, fontSize: 17, lineHeight: 24 },

  emptyBox: { alignItems: 'center', gap: 10, paddingVertical: 28, paddingHorizontal: 8 },
  emptyText: { fontFamily: FONT.body, fontSize: 16, lineHeight: 23, textAlign: 'center' },
});
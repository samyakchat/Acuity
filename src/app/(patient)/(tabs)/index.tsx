import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Ellipse, Path } from 'react-native-svg';
import { router, useFocusEffect } from 'expo-router';
import { CalendarCheck, ChevronRight, CircleAlert, CircleCheck, LogOut } from 'lucide-react-native';
import FatButton from '@/components/fatUI/fatButton';
import { useTheme, FONT } from '@/components/fatUI/theme';
import { supabase } from '@/lib/supabase';
import { checkAp } from '../tests/engine';
import { Image } from 'expo-image';

function MochiArt({ size = 150 }: { size?: number }) {
  const theme = useTheme();
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

export default function PatientHome() {
  const theme = useTheme();
  const press = useRef(new Animated.Value(1)).current;

  const [name, setName] = useState('');
  const [passedApt, setPassedApt] = useState<boolean | null>(null); // null = still checking
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      setFailed(false);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const full = (user?.user_metadata?.full_name as string | undefined) ?? '';
      setName(full.trim().split(' ')[0] ?? '');
      setPassedApt(await checkAp());
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

  const pressTo = (v: number) =>
    Animated.spring(press, { toValue: v, friction: 6, tension: 140, useNativeDriver: true }).start();

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
                  onPressIn={() => pressTo(0.97)}
                  onPressOut={() => pressTo(1)}
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

              <Enter index={2}>
                <View style={[styles.card, { backgroundColor: theme.fieldBg, borderColor: theme.line }]}>
                  <View style={styles.cardRow}>
                    <CircleCheck size={22} color={theme.primary} strokeWidth={2.5} />
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Introduction Activity Done</Text>
                  </View>
                  <Text style={[styles.cardBody, { color: theme.textSoft }]}>Mochi has gotten to learn you, thank you!</Text>
                </View>
              </Enter>

              {/* HARDCODED placeholder until daily tests exist */}
              <Enter index={3}>
                <View style={[styles.card, { backgroundColor: theme.fieldBg, borderColor: theme.line }]}>
                  <View style={styles.cardRow}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Daily check-in</Text>
                  </View>
                  <Text style={[styles.cardBody, { color: theme.textSoft }]}>holdup on that</Text>
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

  mochiRow: { alignItems: 'center' },

  card: { borderRadius: 18, borderWidth: 2, padding: 16, gap: 8 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontFamily: FONT.bold, fontSize: 20, lineHeight: 26 },
  cardBody: { fontFamily: FONT.body, fontSize: 17, lineHeight: 24 },

  emptyBox: { alignItems: 'center', gap: 10, paddingVertical: 28, paddingHorizontal: 8 },
  emptyText: { fontFamily: FONT.body, fontSize: 16, lineHeight: 23, textAlign: 'center' },
});
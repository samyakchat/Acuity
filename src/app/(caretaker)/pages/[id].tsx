import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  LayoutAnimation,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { ArrowLeft, Brain, CalendarDays, ChevronDown, CircleAlert, ClipboardList, Info } from 'lucide-react-native';
import FatButton from '@/components/fatUI/fatButton';
import { useTheme, FONT } from '@/components/fatUI/theme';
import BrainMap, { BAND_LABEL, ScoreBar, bandOf } from '@/components/brain/BrainMap';
import DailyResults from '@/components/caretaker/DailyResults';
import { summarizeAptitude, type AptitudeRaw, type AptitudeSummary } from '@/lib/aptitude';
import { supabase } from '@/lib/supabase';

type Tab = 'aptitude' | 'daily';

/* Same staggered fade + rise used on the pairing list */
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

function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function PatientPage() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const patientId = Array.isArray(id) ? id[0] : id;


  const [tab, setTab] = useState<Tab>('aptitude');
  const [name, setName] = useState<string>('');
  const [summary, setSummary] = useState<AptitudeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [dailyKey, setDailyKey] = useState(0);

  const requestId = useRef(0);
  const chevron = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    if (!patientId) return;
    const req = ++requestId.current;
    try {
      const [{ data: profile, error: profileError }, { data: tests, error: testError }] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', patientId).maybeSingle(),
        supabase.from('aptitude_test').select('id, raw').eq('patient_id', patientId),
      ]);
      if (profileError) throw profileError;
      if (testError) throw testError;

      // newest baseline wins
      const latest = (tests ?? [])
        .map((t: any) => t.raw as AptitudeRaw | null)
        .filter((r): r is AptitudeRaw => !!r && typeof r === 'object')
        .sort((a, b) => new Date(b.startedAt ?? 0).getTime() - new Date(a.startedAt ?? 0).getTime())[0];

      if (req !== requestId.current) return;
      setName(profile?.full_name || 'Unnamed patient');
      setSummary(latest ? summarizeAptitude(latest) : null);
      setError(null);
    } catch (e: any) {
      if (req === requestId.current) setError(e?.message ?? 'Could not load this patient.');
    } finally {
      if (req === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [patientId]);

  useEffect(() => {
    load();
    return () => {
      requestId.current++;
    };
  }, [load]);

  const switchTab = (next: Tab) => {
    if (next === tab) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTab(next);
  };

  const toggleDetails = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(chevron, {
      toValue: detailsOpen ? 0 : 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    setDetailsOpen(!detailsOpen);
  };

  const rotate = chevron.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const taken = formatDate(summary?.startedAt ?? null);
  const averageBand = bandOf(summary?.average ?? null);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setDailyKey((k) => k + 1);
              load();
            }}
            tintColor={theme.primary}
          />
        }
      >
        <View style={styles.column}>
          <FatButton
            text="Patients"
            type="secondary"
            size="small"
            icon={ArrowLeft}
            onPress={() => router.back()}
            style={{ alignSelf: 'flex-start' }}
          />

          <View style={styles.header}>
            <Text numberOfLines={2} style={[styles.title, { color: theme.text }]}>
              {loading ? 'Loading...' : name}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSoft }]}>
              {taken ? `Baseline taken ${taken}` : 'Patient results'}
            </Text>
          </View>

          <View style={styles.tabs}>
            <FatButton
              text="Aptitude"
              size="small"
              icon={ClipboardList}
              type={tab === 'aptitude' ? undefined : 'secondary'}
              onPress={() => switchTab('aptitude')}
              style={{ flex: 1 }}
            />
            <FatButton
              text="Daily"
              size="small"
              icon={CalendarDays}
              type={tab === 'daily' ? undefined : 'secondary'}
              onPress={() => switchTab('daily')}
              style={{ flex: 1 }}
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 24 }} />
          ) : error ? (
            <View style={styles.emptyBox}>
              <CircleAlert size={32} color={theme.error} strokeWidth={2.5} />
              <Text style={[styles.emptyText, { color: theme.error }]}>{error}</Text>
              <FatButton
                text="Try again"
                type="secondary"
                size="small"
                onPress={() => {
                  setLoading(true);
                  load();
                }}
                style={{ alignSelf: 'stretch' }}
              />
            </View>
          ) : tab === 'aptitude' ? (
            !summary ? (
              <Enter index={0}>
                <View style={styles.emptyBox}>
                  <ClipboardList size={34} color={theme.textSoft} strokeWidth={2.25} />
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>No aptitude test yet</Text>
                  <Text style={[styles.emptyText, { color: theme.textSoft }]}>
                    Results will appear here once {name || 'your patient'} finishes the starting test.
                  </Text>
                </View>
              </Enter>
            ) : (
              <View style={{ gap: 20 }}>
                {/* Baseline note */}
                <Enter index={0}>
                  <View style={[styles.card, { backgroundColor: theme.fieldBg, borderColor: theme.line }]}>
                    <View style={styles.cardRow}>
                      <Info size={26} color={theme.primary} strokeWidth={2.5} />
                      <Text style={[styles.cardTitle, { color: theme.text }]}>WARNING</Text>
                    </View>
                    <Text style={[styles.body, { color: theme.textSoft }]}>
                      This data was the patients baseline test, meaning these numbers should arise no concern. Acuity uses
                      this basline with additional data to track progress, however, you are still able to view the data.
                    </Text>
                  </View>
                </Enter>

                {/* Overall */}
                <Enter index={1}>
                  <View style={[styles.card, { backgroundColor: theme.fieldBg, borderColor: theme.line }]}>
                    <View style={styles.cardRow}>
                      <Text style={[styles.bigScore, { color: theme.text }]}>
                        {summary.average == null ? '--' : summary.average}
                      </Text>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Average score</Text>
                        <Text style={[styles.body, { color: theme.textSoft }]}>
                          {BAND_LABEL[averageBand]} across {summary.measures.filter((m) => m.score != null).length}{' '}
                          measures
                        </Text>
                      </View>
                    </View>
                    <ScoreBar score={summary.average} />
                  </View>
                </Enter>

                {/* Brain */}
                <Enter index={2}>
                  <View style={{ gap: 12 }}>

                    <BrainMap regions={summary.regions} />
                    <Text style={[styles.body, { color: theme.textSoft, textAlign: 'center' }]}>
                      A simplified picture. Each game mainly relies on one area, but the brain works as a whole.
                    </Text>
                  </View>
                </Enter>

                {/* Every measure */}
                <Enter index={3}>
                  <View style={{ gap: 12 }}>
                    <Pressable
                      onPress={toggleDetails}
                      accessibilityRole="button"
                      accessibilityState={{ expanded: detailsOpen }}
                      style={[styles.toggle, { backgroundColor: theme.fieldBg, borderColor: theme.line }]}
                    >
                      <Text style={[styles.cardTitle, { color: theme.text, flex: 1 }]}>
                        {detailsOpen ? 'Hide every result' : 'See every result'}
                      </Text>
                      <Animated.View style={{ transform: [{ rotate }] }}>
                        <ChevronDown size={26} color={theme.primary} strokeWidth={2.5} />
                      </Animated.View>
                    </Pressable>

                    {detailsOpen &&
                      summary.measures.map((m, i) => (
                        <Enter key={m.label} index={i}>
                          <View style={[styles.card, { backgroundColor: theme.fieldBg, borderColor: theme.line }]}>
                            <View style={styles.cardRow}>
                              <Text style={[styles.cardTitle, { color: theme.text, flex: 1 }]}>{m.label}</Text>
                              <Text style={[styles.cardTitle, { color: theme.text }]}>
                                {m.score == null ? '--' : m.score}
                              </Text>
                            </View>
                            <ScoreBar score={m.score} />
                            <Text style={[styles.body, { color: theme.textSoft }]}>{m.value}</Text>
                          </View>
                        </Enter>
                      ))}
                  </View>
                </Enter>
              </View>
            )
          ) : (
            <DailyResults patientId={patientId} name={name} refreshKey={dailyKey} />
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

  tabs: { flexDirection: 'row', gap: 10 },

  card: { borderRadius: 18, borderWidth: 2, padding: 16, gap: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontFamily: FONT.bold, fontSize: 19, lineHeight: 24 },
  sectionTitle: { fontFamily: FONT.heavy, fontSize: 21, lineHeight: 27 },
  body: { fontFamily: FONT.body, fontSize: 16, lineHeight: 23 },
  bigScore: { fontFamily: FONT.title, fontSize: 48, lineHeight: 52 },

  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
  },

  emptyBox: { alignItems: 'center', gap: 10, paddingVertical: 28, paddingHorizontal: 8 },
  emptyTitle: { fontFamily: FONT.heavy, fontSize: 21, lineHeight: 27, textAlign: 'center' },
  emptyText: { fontFamily: FONT.body, fontSize: 16, lineHeight: 23, textAlign: 'center' },
});
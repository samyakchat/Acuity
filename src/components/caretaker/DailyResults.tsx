import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, LayoutAnimation, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Brain,
  CalendarDays,
  ChevronDown,
  CircleAlert,
  Clock,
  Eye,
  MessageSquareText,
  Minus,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';
import FatButton from '@/components/fatUI/fatButton';
import { useTheme, FONT } from '@/components/fatUI/theme';
import BrainMap, { BAND_LABEL, ScoreBar, bandOf } from '@/components/brain/BrainMap';
import {
  areaLabel,
  loadDailyHistory,
  MIN_ENTRIES,
  type DayEntry,
  type MetricCell,
  type Trend,
} from '@/lib/caretakerEngine';

const VISIBLE_DAYS = 7; // days shown up front; anything older sits behind "Earlier days"

type Props = {
  patientId: string | undefined;
  name: string;
  /** bump to refetch (pull-to-refresh on the page) */
  refreshKey?: number;
};

/* Same staggered fade + rise as the rest of the page */
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

function Chevron({ open, color }: { open: boolean; color: string }) {
  const v = useRef(new Animated.Value(open ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(v, {
      toValue: open ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [open]);

  const rotate = v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <ChevronDown size={26} color={color} strokeWidth={2.5} />
    </Animated.View>
  );
}

const TREND_COPY: Record<Exclude<Trend, 'insufficient'>, string> = {
  improving: 'Improving',
  stable: 'Holding steady',
  declining: 'Going down',
};

function TrendRow({ m }: { m: MetricCell }) {
  const theme = useTheme();
  const played = m.score != null;

  let Icon = Clock;
  let color = theme.textSoft;
  let text = `Not enough data yet (${m.points} of ${MIN_ENTRIES} results)`;
  if (m.trend !== 'insufficient') {
    text = TREND_COPY[m.trend];
    Icon = m.trend === 'improving' ? TrendingUp : m.trend === 'declining' ? TrendingDown : Minus;
    color = m.trend === 'improving' ? theme.primary : m.trend === 'declining' ? theme.error : theme.textSoft;
  }

  return (
    <View style={{ gap: 8 }}>
      <View style={styles.cardRow}>
        <Text style={[styles.cardTitle, { color: theme.text, flex: 1 }]}>{m.label}</Text>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{played ? m.score : '--'}</Text>
      </View>
      <ScoreBar score={m.score} />
      <View style={[styles.cardRow, { gap: 8 }]}>
        <Icon size={22} color={color} strokeWidth={2.5} />
        <Text style={[styles.body, { color, flex: 1 }]}>
          {text}
          {!played ? ' · Not played this day' : ''}
        </Text>
      </View>
    </View>
  );
}

function DayDetail({ day, name }: { day: DayEntry; name: string }) {
  const theme = useTheme();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { summary, note } = day;
  const scored = summary ? summary.measures.filter((m: any) => m.score != null) : [];
  const hasScores = scored.length > 0;
  const average = hasScores ? summary!.average : null;
  const flagged = note?.decliningAreas ?? [];
  const cardStyle = [styles.card, { backgroundColor: theme.fieldBg, borderColor: theme.line }];

  const toggleDetails = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDetailsOpen((o) => !o);
  };

  let i = 0;
  return (
    <View style={{ gap: 20 }}>
      {/* Which day + what kind of check-in */}
      <Enter index={i++}>
        <View style={{ gap: 4 }}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{day.dayLong}</Text>
          <View style={[styles.cardRow, { gap: 8 }]}>
            {day.focusLabel ? <Target size={22} color={theme.primary} strokeWidth={2.5} /> : null}
            <Text style={[styles.body, { color: theme.textSoft, flex: 1 }]}>
              {day.focusLabel ? `Focused practice: ${day.focusLabel}` : 'Full check-in'}
            </Text>
          </View>
        </View>
      </Enter>

      {/* Written note for the caretaker */}
      <Enter index={i++}>
        <View style={cardStyle}>
          <View style={styles.cardRow}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Note for you</Text>
          </View>
          <Text style={[styles.body, { color: theme.textSoft }]}>
            {note?.reason ??
              'No written note was saved for this day. The results and trends below are still accurate.'}
          </Text>
        </View>
      </Enter>

      {/* Areas flagged for the day - may legitimately be empty */}
      <Enter index={i++}>
        <View style={cardStyle}>
          <View style={styles.cardRow}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Areas to keep an eye on</Text>
          </View>
          {flagged.length > 0 ? (
            <View style={{ gap: 10 }}>
              {flagged.map((a: any) => (
                <View key={a} style={[styles.cardRow, { gap: 10 }]}>
                  <TrendingDown size={22} color={theme.error} strokeWidth={2.5} />
                  <Text style={[styles.cardTitle, { color: theme.text, flex: 1 }]}>{areaLabel(a)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.body, { color: theme.textSoft }]}>
              {!note
                ? 'Nothing was recorded for this day. Check the trends below.'
                : day.focusLabel
                  ? `No areas were listed on this day, but practice centered on ${day.focusLabel}. The trends below show how each area is moving.`
                  : 'No areas were listed on this day. The trends below show how each area is moving.'}
            </Text>
          )}
        </View>
      </Enter>

      {/* Overall score for the day */}
      {hasScores && (
        <Enter index={i++}>
          <View style={cardStyle}>
            <View style={styles.cardRow}>
              <Text style={[styles.bigScore, { color: theme.text }]}>{average == null ? '--' : average}</Text>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>Average score</Text>
                <Text style={[styles.body, { color: theme.textSoft }]}>
                  {BAND_LABEL[bandOf(average ?? null)]} across {scored.length} {scored.length === 1 ? 'measure' : 'measures'}
                </Text>
              </View>
            </View>
            <ScoreBar score={average ?? null} />
          </View>
        </Enter>
      )}

      {/* Trends */}
      <Enter index={i++}>
        <View style={{ gap: 12 }}>
          <View style={styles.cardRow}>
            <TrendingUp size={26} color={theme.primary} strokeWidth={2.5} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Trends</Text>
          </View>
          <Text style={[styles.body, { color: theme.textSoft }]}>
            A trend needs at least {MIN_ENTRIES} results in an area. Until then you will see how far along it is.
          </Text>
          <View style={[cardStyle, { gap: 20 }]}>
            {day.metrics.map((m: any) => (
              <TrendRow key={m.key} m={m} />
            ))}
          </View>
        </View>
      </Enter>

      {/* Brain */}
      {hasScores && (
        <Enter index={i++}>
          <View style={{ gap: 12 }}>
            <View style={styles.cardRow}>
            </View>
            <BrainMap regions={summary!.regions} />
            <Text style={[styles.body, { color: theme.textSoft, textAlign: 'center' }]}>
              {day.focusLabel
                ? 'Only the areas practiced on this day are filled in. A simplified picture of how the brain works as a whole.'
                : 'A simplified picture. Each game mainly relies on one area, but the brain works as a whole.'}
            </Text>
          </View>
        </Enter>
      )}

      {/* Every result */}
      {hasScores && (
        <Enter index={i++}>
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
              <Chevron open={detailsOpen} color={theme.primary} />
            </Pressable>

            {detailsOpen &&
              scored.map((m: any, idx: any) => (
                <Enter key={m.label} index={idx}>
                  <View style={cardStyle}>
                    <View style={styles.cardRow}>
                      <Text style={[styles.cardTitle, { color: theme.text, flex: 1 }]}>{m.label}</Text>
                      <Text style={[styles.cardTitle, { color: theme.text }]}>{m.score}</Text>
                    </View>
                    <ScoreBar score={m.score} />
                    <Text style={[styles.body, { color: theme.textSoft }]}>{m.value}</Text>
                  </View>
                </Enter>
              ))}
          </View>
        </Enter>
      )}

      {!hasScores && (
        <Enter index={i++}>
          <View style={styles.emptyBox}>
            <Clock size={34} color={theme.textSoft} strokeWidth={2.25} />
            <Text style={[styles.emptyText, { color: theme.textSoft }]}>
              The detailed results for this day could not be read{name ? ` for ${name}` : ''}.
            </Text>
          </View>
        </Enter>
      )}
    </View>
  );
}

export default function DailyResults({ patientId, name, refreshKey = 0 }: Props) {
  const theme = useTheme();
  const [days, setDays] = useState<DayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [earlierOpen, setEarlierOpen] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    if (!patientId) return;
    const req = ++requestId.current;
    try {
      const next = await loadDailyHistory(patientId);
      if (req !== requestId.current) return;
      setDays(next);
      setError(null);
    } catch (e: any) {
      if (req === requestId.current) setError(e?.message ?? 'Could not load daily results.');
    } finally {
      if (req === requestId.current) setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    load();
    return () => {
      requestId.current++;
    };
  }, [load, refreshKey]);

  const selectDay = (id: string) => {
    if (id === selectedId) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedId(id);
  };

  const toggleEarlier = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEarlierOpen((o) => !o);
  };

  if (loading) return <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 24 }} />;

  if (error) {
    return (
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
    );
  }

  if (days.length === 0) {
    return (
      <Enter index={0}>
        <View style={styles.emptyBox}>
          <CalendarDays size={34} color={theme.textSoft} strokeWidth={2.25} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No daily check-ins yet</Text>
          <Text style={[styles.emptyText, { color: theme.textSoft }]}>
            Once {name || 'your patient'} completes a daily check-in, you will see how each day went and how things are
            trending here.
          </Text>
        </View>
      </Enter>
    );
  }

  const recent = days.slice(0, VISIBLE_DAYS);
  const earlier = days.slice(VISIBLE_DAYS);
  const selected = days.find((d) => d.id === selectedId) ?? days[0];

  return (
    <View style={{ gap: 20 }}>
      <Enter index={0}>
        <View style={{ gap: 12 }}>
          <View style={styles.cardRow}>
            <CalendarDays size={26} color={theme.primary} strokeWidth={2.5} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily check-ins</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingRight: 4 }}
          >
            {recent.map((d) => (
              <FatButton
                key={d.id}
                text={d.dayShort}
                size="small"
                type={d.id === selected.id ? undefined : 'secondary'}
                onPress={() => selectDay(d.id)}
              />
            ))}
          </ScrollView>

          {earlier.length > 0 && (
            <>
              <Pressable
                onPress={toggleEarlier}
                accessibilityRole="button"
                accessibilityState={{ expanded: earlierOpen }}
                style={[styles.toggle, { backgroundColor: theme.fieldBg, borderColor: theme.line }]}
              >
                <Text style={[styles.cardTitle, { color: theme.text, flex: 1 }]}>
                  {earlierOpen ? 'Hide earlier days' : `Earlier days (${earlier.length})`}
                </Text>
                <Chevron open={earlierOpen} color={theme.primary} />
              </Pressable>

              {earlierOpen && (
                <View style={styles.wrap}>
                  {earlier.map((d, idx) => (
                    <Enter key={d.id} index={idx}>
                      <FatButton
                        text={d.dayShort}
                        size="small"
                        type={d.id === selected.id ? undefined : 'secondary'}
                        onPress={() => selectDay(d.id)}
                      />
                    </Enter>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </Enter>

      {/* key remounts the detail so its entrance animation replays for each day */}
      <DayDetail key={selected.id} day={selected} name={name} />
    </View>
  );
}

const styles = StyleSheet.create({
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

  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  emptyBox: { alignItems: 'center', gap: 10, paddingVertical: 28, paddingHorizontal: 8 },
  emptyTitle: { fontFamily: FONT.heavy, fontSize: 21, lineHeight: 27, textAlign: 'center' },
  emptyText: { fontFamily: FONT.body, fontSize: 16, lineHeight: 23, textAlign: 'center' },
});
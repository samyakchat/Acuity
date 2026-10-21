import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { useTheme, FONT } from '@/components/fatUI/theme';

/* ------------------------------------------------------------------ */
/* Types + shared helpers (the daily results page reuses all of these) */
/* ------------------------------------------------------------------ */

export type BrainRegionId = 'frontal' | 'parietal' | 'temporal' | 'occipital' | 'cerebellum';

export type BrainMeasure = {
  label: string;
  /** Human readable result, e.g. "3 of 3 correct" */
  value: string;
  /** 0-100, or null when it couldn't be measured */
  score: number | null;
};

export type BrainRegion = {
  id: BrainRegionId;
  /** 0-100, or null when nothing in this region was measured */
  score: number | null;
  measures: BrainMeasure[];
};

export const REGION_ORDER: BrainRegionId[] = ['frontal', 'parietal', 'temporal', 'occipital', 'cerebellum'];

export const REGION_INFO: Record<BrainRegionId, { title: string; blurb: string }> = {
  frontal: {
    title: 'Frontal lobe',
    blurb: 'Planning, reasoning, everyday tasks and finding words.',
  },
  parietal: {
    title: 'Parietal lobe',
    blurb: 'Spatial awareness and finding your way around.',
  },
  temporal: {
    title: 'Temporal lobe',
    blurb: 'Memory, recall and knowing where and when you are.',
  },
  occipital: {
    title: 'Occipital lobe',
    blurb: 'Seeing and noticing what is in front of you.',
  },
  cerebellum: {
    title: 'Cerebellum',
    blurb: 'Reaction speed and quick, coordinated responses.',
  },
};

export type Band = 'strong' | 'mixed' | 'lower' | 'none';

export const bandOf = (score: number | null): Band =>
  score == null ? 'none' : score >= 75 ? 'strong' : score >= 50 ? 'mixed' : 'lower';

export const BAND_LABEL: Record<Band, string> = {
  strong: 'Strong',
  mixed: 'Mixed',
  lower: 'Lower',
  none: 'Not measured',
};

export const BAND_OPACITY: Record<Band, number> = {
  strong: 1,
  mixed: 0.65,
  lower: 0.4,
  none: 1,
};

export function ScoreBar({ score }: { score: number | null }) {
  const theme = useTheme();
  const fill = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // width can't use the native driver
    Animated.timing(fill, {
      toValue: score ?? 0,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [score]);

  const width = fill.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.barTrack, { backgroundColor: theme.fieldBg, borderColor: theme.line }]}>
      <Animated.View
        style={[
          styles.barFill,
          { width, backgroundColor: theme.primary, opacity: BAND_OPACITY[bandOf(score)] },
        ]}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Brain artwork: lateral view, front on the left                       */
/* Shape and lobe placement come first; cortical folds are intentionally
   omitted for now so the anatomy reads clearly at app-icon scale.       */
/* ------------------------------------------------------------------ */

// Lateral silhouette shaped to match the supplied reference: a broad domed
// cerebrum, a fuller anterior pole, a deeper lower temporal curve, and a
// distinct posterior cerebellum with a tapered, angled brainstem.
const CEREBRUM_OUTLINE =
  'M140,8 C131,7 122,9 115,12 C104,10 93,12 81,18 C72,18 63,23 58,28 C50,28 45,33 39,40 C31,45 27,51 25,59 C20,64 17,70 16,77 C11,83 10,89 14,96 C10,103 11,111 14,118 C16,129 23,137 33,142 C40,146 49,149 55,151 C57,156 59,162 62,167 C61,172 68,176 75,180 C87,188 98,191 111,192 C123,194 137,192 148,190 C155,197 160,204 165,214 C171,225 178,240 185,249 C190,254 198,253 201,248 C201,241 197,232 196,226 C207,229 220,231 233,229 C247,227 257,222 263,214 C269,207 271,200 267,193 C280,195 292,191 299,183 C306,174 308,160 306,146 C306,131 301,114 294,101 C292,92 286,83 280,76 C277,66 269,57 260,50 C254,41 244,33 232,26 C222,20 211,17 201,17 C190,11 179,8 166,10 C157,7 148,7 140,8 Z';

const PATHS: Record<BrainRegionId, string> = {
  // The frontal pole follows the rounded front and curves down into the
  // lower frontal surface. Its posterior edge is the central sulcus.
  frontal:
    'M115,12 C122,30 121,47 119,62 C117,78 113,93 111,103 C99,109 92,119 85,130 C77,143 66,151 55,151 C49,149 40,146 33,142 C23,137 16,129 14,118 C11,111 10,103 14,96 C10,89 11,83 16,77 C17,70 20,64 25,59 C27,51 31,45 39,40 C45,33 50,28 58,28 C63,23 72,18 81,18 C93,12 104,10 115,12 Z',
  // The parietal lobe makes up the long upper dome between the central
  // sulcus and the curved occipital boundary.
  parietal:
    'M115,12 C131,7 148,7 166,10 C179,8 190,11 201,17 C211,17 222,20 232,26 C244,33 254,41 260,50 C256,65 252,83 249,102 C207,92 150,90 111,103 C113,93 117,78 119,62 C121,47 122,30 115,12 Z',
  // The occipital lobe rounds down at the rear and meets the cerebellum
  // rather than ending in a straight, angular edge.
  occipital:
    'M260,50 C269,57 277,66 280,76 C286,83 292,92 294,101 C301,114 306,131 306,146 C308,160 306,174 299,183 C292,191 280,195 267,193 C263,170 257,143 249,102 C252,83 256,65 260,50 Z',
  // The temporal lobe forms the deeper, sweeping lower curve of the
  // cerebrum, from the lateral fissure toward the posterior underside.
  temporal:
    'M111,103 C150,90 207,92 249,102 C253,128 260,154 267,193 C251,187 233,178 214,166 C205,162 196,161 188,167 C178,175 167,184 148,190 C137,192 123,194 111,192 C98,191 87,188 75,180 C68,176 61,172 62,167 C59,162 57,156 55,151 C66,151 77,143 85,130 C92,119 99,109 111,103 Z',
  // The cerebellum sits under the posterior lobe as a rounded lower mass.
  cerebellum:
    'M188,167 C196,161 205,162 214,166 C233,178 251,187 267,193 C271,200 269,207 263,214 C257,222 247,227 233,229 C220,231 207,229 196,226 C192,213 187,201 180,190 C182,180 184,173 188,167 Z',
};

// Tapered brainstem, angled down and slightly forward, behind the cerebellum.
const STEM =
  'M148,190 C155,197 160,204 165,214 C171,225 178,240 185,249 C190,254 198,253 201,248 C200,240 196,231 194,221 C192,208 187,194 183,178 C178,178 173,179 169,181 C162,185 156,191 148,190 Z';

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

type Props = {
  regions: BrainRegion[];
  initial?: BrainRegionId;
  /** Shown under the detail title when a region has no data */
  emptyText?: string;
};

export default function BrainMap({ regions, initial = 'frontal', emptyText }: Props) {
  const theme = useTheme();
  const [selected, setSelected] = useState<BrainRegionId>(initial);
  const pulse = useRef(new Animated.Value(1)).current;
  const detail = useRef(new Animated.Value(0)).current;

  const byId = new Map<BrainRegionId, BrainRegion>(regions.map((r) => [r.id, r]));
  const current = byId.get(selected);
  const currentBand = bandOf(current?.score ?? null);

  useEffect(() => {
    detail.setValue(0);
    Animated.timing(detail, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [selected]);

  const select = (id: BrainRegionId) => {
    if (id === selected) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelected(id);
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.025, duration: 90, useNativeDriver: true }),
      Animated.spring(pulse, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
  };

  const detailY = detail.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  return (
    <View style={styles.wrap}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Svg width="100%" height={250} viewBox="0 0 320 260">
          <Path d={CEREBRUM_OUTLINE} fill={theme.line} />
          <Path
            d={STEM}
            fill={theme.line}
            stroke={theme.background}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          <G>
            {/* cerebellum first so the lobes sit on top of it */}
            {(['cerebellum', 'occipital', 'temporal', 'parietal', 'frontal'] as BrainRegionId[]).map((id) => {
              const band = bandOf(byId.get(id)?.score ?? null);
              const isSel = id === selected;
              return (
                <Path
                  key={id}
                  d={PATHS[id]}
                  fill={band === 'none' ? theme.line : theme.primary}
                  fillOpacity={BAND_OPACITY[band]}
                  stroke={isSel ? theme.text : theme.background}
                  strokeWidth={isSel ? 2.5 : 1.2}
                  strokeLinejoin="round"
                  onPress={() => select(id)}
                />
              );
            })}
          </G>
        </Svg>
      </Animated.View>

      <Text style={[styles.hint, { color: theme.textSoft }]}>Tap a part of the brain to see its results.</Text>

      <View style={styles.pills}>
        {REGION_ORDER.map((id) => {
          const isSel = id === selected;
          return (
            <Pressable
              key={id}
              onPress={() => select(id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSel }}
              accessibilityLabel={REGION_INFO[id].title}
              style={[
                styles.pill,
                {
                  backgroundColor: isSel ? theme.primary : theme.fieldBg,
                  borderColor: isSel ? theme.primary : theme.line,
                },
              ]}
            >
              <Text style={[styles.pillText, { color: isSel ? '#FFFFFF' : theme.text }]}>
                {REGION_INFO[id].title}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: theme.fieldBg,
            borderColor: theme.line,
            opacity: detail,
            transform: [{ translateY: detailY }],
          },
        ]}
      >
        <View style={styles.cardHead}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{REGION_INFO[selected].title}</Text>
            <Text style={[styles.cardBlurb, { color: theme.textSoft }]}>{REGION_INFO[selected].blurb}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.cardScore, { color: theme.text }]}>
              {current?.score == null ? '--' : current.score}
            </Text>
            <Text style={[styles.cardBand, { color: theme.textSoft }]}>{BAND_LABEL[currentBand]}</Text>
          </View>
        </View>

        {current && current.measures.length > 0 ? (
          current.measures.map((m) => (
            <View key={m.label} style={styles.measure}>
              <View style={styles.measureTop}>
                <Text style={[styles.measureLabel, { color: theme.text }]}>{m.label}</Text>
                <Text style={[styles.measureScore, { color: theme.text }]}>{m.score == null ? '--' : m.score}</Text>
              </View>
              <ScoreBar score={m.score} />
              <Text style={[styles.measureValue, { color: theme.textSoft }]}>{m.value}</Text>
            </View>
          ))
        ) : (
          <Text style={[styles.cardBlurb, { color: theme.textSoft }]}>
            {emptyText ?? 'Nothing was measured for this area yet.'}
          </Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  hint: { fontFamily: FONT.body, fontSize: 16, lineHeight: 23, textAlign: 'center' },

  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  pill: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, borderWidth: 2 },
  pillText: { fontFamily: FONT.bold, fontSize: 16, lineHeight: 21 },

  card: { borderRadius: 18, borderWidth: 2, padding: 16, gap: 16 },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardTitle: { fontFamily: FONT.heavy, fontSize: 21, lineHeight: 27 },
  cardBlurb: { fontFamily: FONT.body, fontSize: 16, lineHeight: 23 },
  cardScore: { fontFamily: FONT.title, fontSize: 34, lineHeight: 38 },
  cardBand: { fontFamily: FONT.bold, fontSize: 16, lineHeight: 21 },

  measure: { gap: 6 },
  measureTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  measureLabel: { flex: 1, fontFamily: FONT.bold, fontSize: 17, lineHeight: 23 },
  measureScore: { fontFamily: FONT.bold, fontSize: 17, lineHeight: 23 },
  measureValue: { fontFamily: FONT.body, fontSize: 16, lineHeight: 23 },

  barTrack: { height: 12, borderRadius: 8, borderWidth: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
});
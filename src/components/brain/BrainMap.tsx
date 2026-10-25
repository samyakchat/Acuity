import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { ClipPath, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { useTheme, FONT } from '@/components/fatUI/theme';


export type BrainRegionId = 'frontal' | 'parietal' | 'temporal' | 'occipital' | 'cerebellum';

export type BrainMeasure = {
  label: string;
  value: string;
  score: number | null;
};

export type BrainRegion = {
  id: BrainRegionId;
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

const CEREBRUM_OUTLINE =
  'M140,8 C131,7 122,9 115,12 C104,10 93,12 81,18 C72,18 63,23 58,28 C50,28 45,33 39,40 C31,45 27,51 25,59 C20,64 17,70 16,77 C11,83 10,89 14,96 C10,103 11,111 14,118 C16,129 23,137 33,142 C40,146 49,149 55,151 C57,156 59,162 62,167 C61,172 68,176 75,180 C87,188 98,191 111,192 C123,194 137,192 148,190 C155,197 160,204 165,214 C171,225 178,240 185,249 C190,254 198,253 201,248 C201,241 197,232 196,226 C207,229 220,231 233,229 C247,227 257,222 263,214 C269,207 271,200 267,193 C280,195 292,191 299,183 C306,174 308,160 306,146 C306,131 301,114 294,101 C292,92 286,83 280,76 C277,66 269,57 260,50 C254,41 244,33 232,26 C222,20 211,17 201,17 C190,11 179,8 166,10 C157,7 148,7 140,8 Z';

const PATHS: Record<BrainRegionId, string> = {
  frontal:
    'M115,12 C122,30 121,47 119,62 C117,78 113,93 111,103 C99,109 92,119 85,130 C77,143 66,151 55,151 C49,149 40,146 33,142 C23,137 16,129 14,118 C11,111 10,103 14,96 C10,89 11,83 16,77 C17,70 20,64 25,59 C27,51 31,45 39,40 C45,33 50,28 58,28 C63,23 72,18 81,18 C93,12 104,10 115,12 Z',
  parietal:
    'M115,12 C131,7 148,7 166,10 C179,8 190,11 201,17 C211,17 222,20 232,26 C244,33 254,41 260,50 C256,65 252,83 249,102 C207,92 150,90 111,103 C113,93 117,78 119,62 C121,47 122,30 115,12 Z',
  occipital:
    'M260,50 C269,57 277,66 280,76 C286,83 292,92 294,101 C301,114 306,131 306,146 C308,160 306,174 299,183 C292,191 280,195 267,193 C263,170 257,143 249,102 C252,83 256,65 260,50 Z',
  temporal:
    'M111,103 C150,90 207,92 249,102 C253,128 260,154 267,193 C251,187 233,178 214,166 C205,162 196,161 188,167 C178,175 167,184 148,190 C137,192 123,194 111,192 C98,191 87,188 75,180 C68,176 61,172 62,167 C59,162 57,156 55,151 C66,151 77,143 85,130 C92,119 99,109 111,103 Z',
  cerebellum:
    'M188,167 C196,161 205,162 214,166 C233,178 251,187 267,193 C271,200 269,207 263,214 C257,222 247,227 233,229 C220,231 207,229 196,226 C192,213 187,201 180,190 C182,180 184,173 188,167 Z',
};

const STEM =
  'M148,190 C155,197 160,204 165,214 C171,225 178,240 185,249 C190,254 198,253 201,248 C200,240 196,231 194,221 C192,208 187,194 183,178 C178,178 173,179 169,181 C162,185 156,191 148,190 Z';

const CORTICAL_FOLDS: Record<BrainRegionId, string[]> = {
  frontal: [
    'M27 66 C34 58 43 58 49 64 C55 70 52 77 45 82',
    'M22 91 C30 84 38 86 42 93 C46 100 41 107 34 112',
    'M31 122 C38 127 46 125 51 119 C56 113 58 107 65 103',
    'M44 43 C51 36 60 37 64 44 C68 50 64 57 59 61',
    'M62 29 C69 25 76 29 78 36 C80 42 76 47 71 51',
    'M83 21 C91 26 93 33 89 41 C86 47 85 54 89 61',
    'M102 17 C108 25 108 33 104 42 C100 50 102 58 107 66',
    'M105 75 C99 81 97 88 100 94',
  ],
  parietal: [
    'M132 18 C141 25 141 33 136 40 C131 47 134 54 141 59',
    'M153 14 C162 21 163 29 158 37 C153 44 157 51 164 57',
    'M176 15 C185 22 186 30 181 37 C177 44 181 51 189 57',
    'M199 23 C207 29 208 37 202 44 C197 50 201 57 209 63',
    'M222 32 C231 40 230 47 225 54 C220 60 223 67 231 73',
    'M244 49 C251 56 251 64 246 71 C242 77 245 84 251 90',
    'M145 72 C157 65 168 68 174 75 C179 81 176 86 169 89',
    'M188 68 C199 62 211 66 216 73 C221 79 217 85 210 89',
  ],
  temporal: [
    'M78 150 C89 143 100 146 107 153 C114 160 123 161 131 155',
    'M79 166 C91 160 101 163 109 170 C117 176 129 176 138 170',
    'M91 181 C101 177 109 181 117 185',
    'M124 116 C135 109 146 111 151 118 C156 124 152 131 145 135',
    'M157 109 C168 103 179 106 184 113 C189 120 184 127 178 131',
    'M192 109 C203 104 214 108 218 115 C222 122 218 128 212 133',
    'M227 119 C237 117 242 123 242 130 C243 137 239 143 234 147',
    'M171 145 C181 139 191 142 197 148 C202 154 198 161 192 165',
    'M132 145 C142 139 151 142 156 148',
  ],
  occipital: [
    'M266 64 C273 72 273 80 267 87 C262 93 264 100 271 105',
    'M283 91 C289 99 288 107 282 113 C277 119 280 126 286 131',
    'M294 132 C299 140 295 148 289 153 C284 158 286 165 291 170',
    'M279 173 C284 178 283 184 278 189',
  ],
  cerebellum: [],
};

const CORTICAL_FINE_FOLDS: Partial<Record<BrainRegionId, string[]>> = {
  frontal: [
    'M36 52 C42 47 48 47 52 51',
    'M58 101 C64 94 71 91 78 93',
    'M78 71 C84 65 91 65 96 69',
  ],
  parietal: [
    'M126 49 C132 43 138 44 143 48',
    'M168 32 C174 27 180 29 184 33',
    'M204 83 C213 77 223 79 227 84',
    'M231 58 C237 55 242 58 245 62',
  ],
  temporal: [
    'M99 132 C106 126 113 127 118 131',
    'M149 157 C158 151 166 153 171 157',
    'M203 139 C211 135 220 138 224 143',
  ],
  occipital: [
    'M270 118 C276 113 282 115 285 120',
    'M297 164 C300 169 297 175 293 178',
  ],
  cerebellum: [],
};



type Props = {
  regions: BrainRegion[];
  initial?: BrainRegionId;
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
          <Defs>
            <LinearGradient id="brainSurfaceSheen" x1="0" y1="0" x2="0.82" y2="1">
              <Stop offset="0%" stopColor="#BFEAF2" stopOpacity={0.2} />
              <Stop offset="42%" stopColor="#BFEAF2" stopOpacity={0.025} />
              <Stop offset="100%" stopColor="#07384A" stopOpacity={0.13} />
            </LinearGradient>
            <ClipPath id="frontalClip"><Path d={PATHS.frontal} /></ClipPath>
            <ClipPath id="parietalClip"><Path d={PATHS.parietal} /></ClipPath>
            <ClipPath id="temporalClip"><Path d={PATHS.temporal} /></ClipPath>
            <ClipPath id="occipitalClip"><Path d={PATHS.occipital} /></ClipPath>
            <ClipPath id="cerebellumClip"><Path d={PATHS.cerebellum} /></ClipPath>
          </Defs>

          {/* A quiet base silhouette unifies the lobes and stem. */}
          <Path d={CEREBRUM_OUTLINE} fill={theme.line} />
          <Path d={STEM} fill={theme.line} stroke="#24596B" strokeWidth={0.9} strokeLinejoin="round" />

          {/* Score overlays remain separate, selectable regions. Boundaries use
              muted blue-green ink rather than bright background-colored seams. */}
          <G>
            {(['cerebellum', 'occipital', 'temporal', 'parietal', 'frontal'] as BrainRegionId[]).map((id) => {
              const band = bandOf(byId.get(id)?.score ?? null);
              const isSel = id === selected;
              return (
                <Path
                  key={id}
                  d={PATHS[id]}
                  fill={band === 'none' ? theme.line : theme.primary}
                  fillOpacity={BAND_OPACITY[band]}
                  stroke={isSel ? '#174758' : '#2E6878'}
                  strokeOpacity={isSel ? 0.95 : 0.58}
                  strokeWidth={isSel ? 1.65 : 0.8}
                  strokeLinejoin="round"
                  onPress={() => select(id)}
                />
              );
            })}
          </G>

          <G pointerEvents="none">
            {(['cerebellum', 'occipital', 'temporal', 'parietal', 'frontal'] as BrainRegionId[]).map((id) => (
              <Path key={`sheen-${id}`} d={PATHS[id]} fill="url(#brainSurfaceSheen)" />
            ))}
          </G>

          {REGION_ORDER.map((id) => (
            <G key={`folds-${id}`} clipPath={`url(#${id}Clip)`} pointerEvents="none" fill="none">
              <G stroke="#12485A" strokeWidth={1.35} strokeLinecap="round" strokeLinejoin="round" opacity={0.42}>
                {CORTICAL_FOLDS[id].map((d, index) => <Path key={`${id}-groove-${index}`} d={d} />)}
              </G>
              <G transform="translate(-0.45 -0.45)" stroke="#A5DCE8" strokeWidth={0.55} strokeLinecap="round" strokeLinejoin="round" opacity={0.26}>
                {CORTICAL_FOLDS[id].map((d, index) => <Path key={`${id}-edge-${index}`} d={d} />)}
              </G>
              <G stroke="#164B5E" strokeWidth={0.72} strokeLinecap="round" strokeLinejoin="round" opacity={0.2}>
                {(CORTICAL_FINE_FOLDS[id] ?? []).map((d, index) => <Path key={`${id}-fine-${index}`} d={d} />)}
              </G>
            </G>
          ))}

          <Path d={CEREBRUM_OUTLINE} fill="none" stroke="#24596B" strokeWidth={1.05} strokeOpacity={0.72} pointerEvents="none" />

          <G pointerEvents="auto">
            {(['cerebellum', 'occipital', 'temporal', 'parietal', 'frontal'] as BrainRegionId[]).map((id) => (
              <Path
                key={`hit-${id}`}
                d={PATHS[id]}
                fill="#FFFFFF"
                fillOpacity={0.001}
                stroke="none"
                onPress={() => select(id)}
              />
            ))}
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
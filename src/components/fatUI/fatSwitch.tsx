import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { darken, useTheme } from '@/components/fatUI/theme';

// Matches FatButton "small": 56 face height, 4 edge, 16 radius.
const HEIGHT = 56;
const EDGE = 4;
const RADIUS = 16;
const WIDTH = 104;
const PAD = 8;
const THUMB = HEIGHT - PAD * 2; // 40
const TRAVEL = WIDTH - PAD * 2 - THUMB; // 48

export type FatSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;

  // overrides
  color?: string; // track color when ON (defaults to theme.primary)
  edgeColor?: string; // ON edge (defaults to darkened `color`, or theme.primaryEdge)
  offColor?: string; // track color when OFF (defaults to theme.secondaryFace)
  offEdgeColor?: string; // OFF edge (defaults to darkened `offColor`, or theme.secondaryEdge)
  thumbColor?: string; // knob face when ON (defaults to white)
  thumbEdgeColor?: string; // knob underside when ON
  offThumbColor?: string; // knob face when OFF (defaults to gray in light mode, white in dark mode)
  offThumbEdgeColor?: string; // knob underside when OFF

  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export default function FatSwitch({
  value,
  onValueChange,
  disabled,
  color,
  edgeColor,
  offColor,
  offEdgeColor,
  thumbColor,
  thumbEdgeColor,
  offThumbColor,
  offThumbEdgeColor,
  style,
  accessibilityLabel,
}: FatSwitchProps) {
  const theme = useTheme();

  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const y = useRef(new Animated.Value(0)).current;
  const first = useRef(true);

  const onFace = color ?? theme.primary;
  const onEdge = edgeColor ?? (color ? darken(color) : theme.primaryEdge);
  const offFace = offColor ?? theme.secondaryFace;
  const offEdge = offEdgeColor ?? (offColor ? darken(offColor) : theme.secondaryEdge);
  const knob = thumbColor ?? '#FFFFFF';
  const knobEdge = thumbEdgeColor ?? darken(knob);
  const knobOff = offThumbColor ?? (theme.isDark ? '#FFFFFF' : '#C4C9D0');
  const knobOffEdge = offThumbEdgeColor ?? darken(knobOff);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    Animated.parallel([
      Animated.spring(progress, {
        toValue: value ? 1 : 0,
        speed: 22,
        bounciness: 7,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 90, useNativeDriver: true }),
        Animated.spring(pulse, { toValue: 1, speed: 24, bounciness: 8, useNativeDriver: true }),
      ]),
    ]).start();
  }, [value]);

  const press = (to: number, bounciness: number) =>
    Animated.spring(y, {
      toValue: to,
      speed: 40,
      bounciness,
      useNativeDriver: true,
    }).start();

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TRAVEL],
  });
  const onOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const layer = (face: string, edge: string) => ({
    backgroundColor: face,
    borderColor: edge,
  });

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      onPressIn={() => press(EDGE, 0)}
      onPressOut={() => press(0, 8)}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      style={[{ width: WIDTH, opacity: disabled ? 0.5 : 1 }, style]}
    >
      <View style={{ width: WIDTH, height: HEIGHT + EDGE }}>
        {/* Edge (the 3D underside), crossfades between off and on */}
        <View style={[styles.edge, { backgroundColor: offEdge }]} />
        <Animated.View style={[styles.edge, { backgroundColor: onEdge, opacity: onOpacity }]} />

        {/* Face */}
        <Animated.View style={[styles.face, { transform: [{ translateY: y }] }]}>
          <View style={[styles.layer, layer(offFace, offEdge)]} />
          <Animated.View style={[styles.layer, layer(onFace, onEdge), { opacity: onOpacity }]} />

          <Animated.View
            style={[styles.thumb, { transform: [{ translateX }, { scale: pulse }] }]}
          >
            <View style={StyleSheet.absoluteFill}>
              <View style={[styles.thumbEdge, { backgroundColor: knobOffEdge }]} />
              <View style={[styles.thumbFace, { backgroundColor: knobOff }]} />
            </View>
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: onOpacity }]}>
              <View style={[styles.thumbEdge, { backgroundColor: knobEdge }]} />
              <View style={[styles.thumbFace, { backgroundColor: knob }]} />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  edge: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: HEIGHT,
    borderRadius: RADIUS,
  },
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEIGHT,
  },
  layer: {
    ...StyleSheet.absoluteFill,
    borderRadius: RADIUS,
    borderWidth: 2,
  },
  thumb: {
    position: 'absolute',
    top: PAD,
    left: PAD,
    width: THUMB,
    height: THUMB,
  },
  thumbEdge: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: THUMB,
    borderRadius: RADIUS - 4,
  },
  thumbFace: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: THUMB - 4,
    borderRadius: RADIUS - 4,
  },
});
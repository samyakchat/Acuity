import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { FONT, darken, useTheme } from '@/components/fatUI/theme';

export type FatButtonType = 'primary' | 'secondary';
export type FatButtonSize = 'small' | 'medium' | 'large';

const SIZES = {
  small: { height: 56, font: 18, icon: 22, edge: 4, radius: 16, gap: 8 },
  medium: { height: 68, font: 24, icon: 28, edge: 5, radius: 18, gap: 10 },
  large: { height: 84, font: 28, icon: 34, edge: 6, radius: 22, gap: 12 },
} as const;

//extra height
const STACKED_EXTRA = 24;

export type FatButtonProps = {
  text: string;
  onPress: () => void;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right' | 'top';
  type?: FatButtonType; 
  size?: FatButtonSize; 
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;

//overrides
  color?: string;
  edgeColor?: string;
  textColor?: string;
  fontSize?: number;
  iconSize?: number;
  height?: number;

  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
};

export default function FatButton({
  text,
  onPress,
  icon: Icon,
  iconPosition = 'left',
  type = 'primary',
  size = 'medium',
  disabled,
  loading,
  loadingText,
  color,
  edgeColor,
  textColor,
  fontSize,
  iconSize,
  height,
  style,
  textStyle,
  accessibilityLabel,
}: FatButtonProps) {
  const theme = useTheme();
  const s = SIZES[size];
  const y = useRef(new Animated.Value(0)).current;

  const isPrimary = type === 'primary';
  const stacked = iconPosition === 'top' && !!Icon;

  const face = color ?? (isPrimary ? theme.primary : theme.secondaryFace);
  const edge =
    edgeColor ??
    (color ? darken(color) : isPrimary ? theme.primaryEdge : theme.secondaryEdge);
  const fg = textColor ?? (isPrimary ? theme.onPrimary : theme.text);

  const faceHeight = height ?? s.height + (stacked ? STACKED_EXTRA : 0);
  const blocked = !!disabled || !!loading;

  const press = (to: number, bounciness: number) =>
    Animated.spring(y, {
      toValue: to,
      speed: 40,
      bounciness,
      useNativeDriver: true,
    }).start();

  const label = loading && loadingText ? loadingText : text;
  const textSize = fontSize ?? s.font;

  return (
    <Pressable
      onPress={onPress}
      disabled={blocked}
      onPressIn={() => press(s.edge, 0)}
      onPressOut={() => press(0, 8)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      style={style}
    >
      <View style={{ height: faceHeight + s.edge }}>
        <View
          style={[
            styles.edge,
            { height: faceHeight, backgroundColor: edge, borderRadius: s.radius },
          ]}
        />
        <Animated.View
          style={[
            styles.face,
            {
              height: faceHeight,
              backgroundColor: face,
              borderColor: edge,
              borderRadius: s.radius,
              gap: s.gap,
              flexDirection: stacked
                ? 'column'
                : iconPosition === 'right'
                  ? 'row-reverse'
                  : 'row',
              opacity: disabled ? 0.5 : loading ? 0.85 : 1,
              transform: [{ translateY: y }],
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={fg} />
          ) : Icon ? (
            <Icon size={iconSize ?? s.icon} color={fg} strokeWidth={2.75} />
          ) : null}
          <Text
            style={[
              {
                fontFamily: FONT.heavy,
                fontSize: textSize,
                lineHeight: Math.round(textSize * 1.2),
                color: fg,
                textAlign: 'center',
                flexShrink: 1,
              },
              textStyle,
            ]}
          >
            {label}
          </Text>
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  edge: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  face: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});
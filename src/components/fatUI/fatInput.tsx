import React, { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { CircleAlert, Eye, EyeOff, type LucideIcon } from 'lucide-react-native';
import { FONT, useTheme, withAlpha } from './theme';

export type FatInputType = 'text' | 'password' | 'email' | 'number';
export type FatInputSize = 'small' | 'medium' | 'large';

const SIZES = {
  small: { height: 56, font: 18, icon: 22, label: 18, radius: 16 },
  medium: { height: 68, font: 22, icon: 26, label: 18, radius: 18 },
  large: { height: 84, font: 26, icon: 30, label: 20, radius: 22 },
} as const;

const TYPE_DEFAULTS: Record<FatInputType, Partial<TextInputProps>> = {
  text: {},
  email: {
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    autoCorrect: false,
    autoComplete: 'email',
    textContentType: 'emailAddress',
  },
  password: {
    autoCapitalize: 'none',
    autoCorrect: false,
    autoComplete: 'current-password',
    textContentType: 'password',
  },
  number: { keyboardType: 'number-pad' },
};

export type FatInputProps = Omit<TextInputProps, 'style' | 'secureTextEntry'> & {
  label?: string;
  icon?: LucideIcon;
  type?: FatInputType; 
  size?: FatInputSize; 
  error?: string;
  hint?: string;
  color?: string;
  textColor?: string;
  fontSize?: number;

  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

const FatInput = forwardRef<TextInput, FatInputProps>(function FatInput(
  {
    label,
    icon: Icon,
    type = 'text',
    size = 'medium',
    error,
    hint,
    color,
    textColor,
    fontSize,
    containerStyle,
    inputStyle,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const theme = useTheme();
  const s = SIZES[size];
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const accent = color ?? theme.primary;
  const isPassword = type === 'password';

  const borderColor = error ? theme.error : focused ? accent : theme.line;
  const backgroundColor = error
    ? theme.errorTint
    : focused
      ? withAlpha(accent, 0.1)
      : theme.fieldBg;
  const iconColor = error ? theme.error : focused ? accent : theme.textSoft;

  return (
    <View style={[{ gap: 8 }, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { fontSize: s.label, color: theme.text }]}>{label}</Text>
      ) : null}

      <View
        style={[
          styles.field,
          { height: s.height, borderRadius: s.radius, borderColor, backgroundColor },
        ]}
      >
        {Icon ? <Icon size={s.icon} color={iconColor} strokeWidth={2.5} /> : null}

        <TextInput
          ref={ref}
          placeholderTextColor={theme.placeholder}
          selectionColor={accent}
          keyboardAppearance={theme.isDark ? 'dark' : 'light'}
          accessibilityLabel={label}
          {...TYPE_DEFAULTS[type]}
          {...rest}
          secureTextEntry={isPassword && !revealed}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            { fontSize: fontSize ?? s.font, color: textColor ?? theme.text },
            inputStyle,
          ]}
        />

        {isPassword ? (
          <Pressable
            onPress={() => setRevealed((r) => !r)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            style={styles.toggle}
          >
            {revealed ? (
              <EyeOff size={s.icon} color={theme.textSoft} strokeWidth={2.5} />
            ) : (
              <Eye size={s.icon} color={theme.textSoft} strokeWidth={2.5} />
            )}
            <Text style={[styles.toggleText, { color: theme.textSoft }]}>
              {revealed ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.message} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <CircleAlert size={22} color={theme.error} strokeWidth={2.5} />
          <Text style={[styles.messageText, { color: theme.error }]}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={[styles.messageText, { color: theme.textSoft }]}>{hint}</Text>
      ) : null}
    </View>
  );
});

export default FatInput;

const styles = StyleSheet.create({
  label: { fontFamily: FONT.heavy },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
  },
  input: { flex: 1, height: '100%', fontFamily: FONT.bold },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 4 },
  toggleText: { fontFamily: FONT.heavy, fontSize: 18 },
  message: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  messageText: { flex: 1, fontFamily: FONT.bold, fontSize: 18, lineHeight: 24 },
});
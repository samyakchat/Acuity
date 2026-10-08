import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FatButton, { type FatButtonType } from '@/components/fatUI/fatButton';
import { FONT, useTheme } from '@/components/fatUI/theme';

const FADE_IN_MS = 180;
const FADE_OUT_MS = 140;
const SLIDE_DISTANCE = 14;

export type FatSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  message: string;
  buttonText?: string;
  buttonType?: FatButtonType;
  dismissOnBackdrop?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function FatSheet({
  visible,
  onDismiss,
  title,
  message,
  buttonText = 'OK',
  buttonType = 'primary',
  dismissOnBackdrop = true,
  style,
}: FatSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: FADE_IN_MS,
        useNativeDriver: true,
      }).start();
    } else if (mounted) {
      Animated.timing(progress, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [SLIDE_DISTANCE, 0],
  });

  const dim = theme.isDark ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.45)';

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape']}
      onRequestClose={onDismiss}
    >
      <View style={styles.root}>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: dim, opacity: progress }]}
        />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={dismissOnBackdrop ? onDismiss : undefined}
          accessible={false}
        />

        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              backgroundColor: theme.secondaryFace,
              borderColor: theme.line,
              paddingBottom: Math.max(insets.bottom, 16) + 8,
              opacity: progress,
              transform: [{ translateY }],
            },
            style,
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: theme.line }]} />

          <Text
            accessibilityRole="header"
            style={[styles.title, { fontFamily: FONT.title, color: theme.text }]}
          >
            {title}
          </Text>

          <Text style={[styles.body, { fontFamily: FONT.body, color: theme.textSoft }]}>
            {message}
          </Text>

          <FatButton
            text={buttonText}
            type={buttonType}
            size="medium"
            onPress={onDismiss}
            style={styles.button}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 2,
    borderBottomWidth: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
    marginBottom: 10,
  },
  body: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 28,
  },
  button: { alignSelf: 'stretch' },
});
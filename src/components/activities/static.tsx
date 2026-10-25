import { Spacing } from "@/constants/theme";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { FONT, useTheme } from "@/components/fatUI/theme";

type PageProps = { onComplete?: () => void };

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/** Shared layout: title, subtitle, Mochi. Completes itself on mount. */
function StaticPage({
  title,
  subtitle,
  image,
  onComplete,
}: {
  title: string;
  subtitle: string;
  image: any;
  onComplete?: () => void;
}) {
  const theme = useTheme();

  // Static pages are "complete" as soon as they appear, so Next is ready.
  useEffect(() => {
  const timer = setTimeout(() => {
    onComplete?.();
  }, 0);
    
    return () => clearTimeout(timer);
    }, [onComplete]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.titleGroup}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSoft }]}>
          {subtitle}
        </Text>
      </View>

      <Image source={image} style={styles.image} />
      <View/>
    </View>
  );
}

/** Start page: "3 fun activities and 4 games" by default. */
function Welcome({
  activities = 3,
  games = 4,
  onComplete,
}: PageProps & { activities?: number; games?: number }) {
  const parts = [];
  if (activities > 0) {
    parts.push(`${activities} fun ${activities === 1 ? "activity" : "activities"}`);
  }
  if (games > 0) parts.push(plural(games, "game"));

  return (
    <StaticPage
      title="Welcome to your daily test"
      subtitle={`Today you have ${parts.join(" and ")}.`}
      image={require("@/assets/mochi_stale/mochi_welcome.svg")}
      onComplete={onComplete}
    />
  );
}

/** Start page variant for 1 game. */
function WelcomeOneGame({ onComplete }: PageProps) {
  return <Welcome activities={3} games={1} onComplete={onComplete} />;
}

/** Shown before the games begin. */
function GameSection({ onComplete }: PageProps) {
  return (
    <StaticPage
      title="Welcome to your game section"
      subtitle="Time to have some fun!"
      image={require("@/assets/images/gamelabel.svg")}
      onComplete={onComplete}
    />
  );
}

/** Shown at the very end. */
function ThankYou({ onComplete }: PageProps) {
  return (
    <StaticPage
      title="Thank you for playing!"
      subtitle="Come back tomorrow for more."
      image={require("@/assets/mochi_stale/mochi_celebrate.svg")}
      onComplete={onComplete}
    />
  );
}

export { Welcome, WelcomeOneGame, GameSection, ThankYou };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  titleGroup: {
    gap: Spacing.three,
  },
  title: {
    textAlign: "center",
    fontFamily: FONT.title,
    fontSize: 40,
    lineHeight: 48,
  },
  subtitle: {
    textAlign: "center",
    fontFamily: FONT.body,
    fontSize: 20,
    lineHeight: 28,
  },
  image: {
    width: 245,
    height: 350,
    alignSelf: "center",
    objectFit: "contain",
  },
});

import { View } from "react-native";
import { useTheme } from "@/components/fatUI/theme";
import FatButton from "./fatButton";
import { ChevronLeft, LucideIcon } from "lucide-react-native";
import { useRouter } from "expo-router";

type Props = {
  backgroundColor?: string;
  rightButtonText?: string;
  rightButtonType?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  rightButtonIcon?: LucideIcon;
  rightButtonOnPress?: () => void;
};

export default function FatHeader({
  backgroundColor,
  rightButtonText = "",
  rightButtonType = "secondary",
  rightButtonIcon,
  rightButtonOnPress,
}: Props) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: backgroundColor || theme.background,
      }}
    >
      {!rightButtonOnPress && (
        <FatButton
          text=""
          onPress={() => router.back()}
          type="secondary"
          size="small"
          icon={ChevronLeft}
          iconSize={32}
          height={48}
        />
      )}

      {rightButtonOnPress && (
        <View style={{ marginLeft: "auto" }}>
          <FatButton
            text={rightButtonText}
            onPress={rightButtonOnPress}
            type={rightButtonType as any}
            size="small"
            icon={rightButtonIcon}
            iconSize={20}
            height={48}
          />
        </View>
      )}
    </View>
  );
}

import { View } from "react-native";
import { useTheme } from "@/components/fatUI/theme";
import FatButton from "./fatButton";
import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
type Props = {
  backgroundColor?: string;
};
export default function FatHeader({backgroundColor}: Props) {
  const theme = useTheme();
  const router = useRouter();
  return (
   <View style={{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: backgroundColor || theme.background,
   }}>
     <FatButton
            text=""
            onPress={() => router.back()}
            type="secondary"
            size="small"
            icon={ChevronLeft}
            iconSize={32}
            height={48}            
        />
   </View>
  );
}

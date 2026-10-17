import { StyleSheet, View } from "react-native";
import { Image, type ImageSource } from "expo-image";

const shapeSources = {
  circle: require("@/assets/game_assets/Circle.png"),
  square: require("@/assets/game_assets/Square.png"),
  triangle: require("@/assets/game_assets/Triangle.png"),
  rectangle: require("@/assets/game_assets/Rectangle.png"),
  oval: require("@/assets/game_assets/Oval.png"),
  hexagon: require("@/assets/game_assets/Hexagon.png"),
  octagon: require("@/assets/game_assets/Octagon.png"),
} satisfies Record<string, ImageSource | number>;

export type Shape = keyof typeof shapeSources;
export const availableShapes: readonly Shape[] = Object.keys(shapeSources) as Shape[];

type ShapeLayout = {
  imageSize: number;
  centerY: number;
};

// Image sizes are measured against the original 541px-wide block asset.
// centerY accounts for shapes drawn off-center within their transparent canvas.
const shapeLayouts: Record<Shape, ShapeLayout> = {
  circle: { imageSize: 470, centerY: 0.5 },
  square: { imageSize: 465, centerY: 0.5 },
  triangle: { imageSize: 520, centerY: 0.5 },
  rectangle: { imageSize: 285, centerY: 0.51925 },
  oval: { imageSize: 308, centerY: 0.51325 },
  hexagon: { imageSize: 515, centerY: 0.5 },
  octagon: { imageSize: 480, centerY: 0.5 },
};

export type BlockProps = {
  width: number;
  shape: Shape;
  accessibilityLabel?: string;
};

export default function Block({
  width,
  shape,
  accessibilityLabel = "Wood block",
}: BlockProps) {
  const layout: ShapeLayout = shapeLayouts[shape];
  const imageSize: number = width * (layout.imageSize / 541);

  return (
    <View
      style={[styles.block, { width }]}
      accessible
      accessibilityLabel={`${accessibilityLabel}, ${shape} on front face`}
    >
      <Image
        source={require("@/assets/game_assets/PatternFactory_WoodBlock.png")}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        accessible={false}
      />
      <Image
        source={shapeSources[shape]}
        style={[
          styles.shape,
          {
            width: imageSize,
            height: imageSize,
            left: width * (250 / 541) - imageSize / 2,
            top: width * (191 / 541) - imageSize * layout.centerY,
          },
        ]}
        contentFit="contain"
        accessible={false}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    flexShrink: 0,
    aspectRatio: 541 / 360,
  },
  shape: {
    position: "absolute",
  },
});

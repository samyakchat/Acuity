import React from "react";
import Svg, { Ellipse } from "react-native-svg";
import {
  Circle,
  Hexagon,
  Octagon,
  RectangleHorizontal,
  Square,
  Triangle,
  type LucideIcon,
} from "lucide-react-native";
import FatButton from "@/components/fatUI/fatButton";

const Oval = (({ size = 24, color = "#000", fill = "none", strokeWidth = 2 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Ellipse
      cx={12}
      cy={12}
      rx={10}
      ry={6.5}
      stroke={color}
      fill={fill}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  </Svg>
)) as unknown as LucideIcon;

type ShapeStyle = {
  icon: LucideIcon;
  color: string;
  scale: number; 
};

// Muted tones so each one sits on the tan wood without glowing or washing out.
const shapeStyles = {
  circle: { icon: Circle, color: "#8B5FBF", scale: 0.62 }, // purple
  hexagon: { icon: Hexagon, color: "#E0B13A", scale: 0.64 }, // yellow
  oval: { icon: Oval, color: "#DE8636", scale: 0.68 }, // orange
  octagon: { icon: Octagon, color: "#D5648F", scale: 0.62 }, // pink
  rectangle: { icon: RectangleHorizontal, color: "#5BA85A", scale: 0.68 }, // green
  square: { icon: Square, color: "#C94A47", scale: 0.56 }, // red
  triangle: { icon: Triangle, color: "#4A82D1", scale: 0.64 }, // blue
} satisfies Record<string, ShapeStyle>;

export type Shape = keyof typeof shapeStyles;
export const availableShapes: readonly Shape[] = Object.keys(shapeStyles) as Shape[];

// Wood block colors (pale tan face, deeper brown edge)
const WOOD_FACE = "#DDBB8A";
const WOOD_EDGE = "#B58E5B";

// Matches the "medium" FatButton preset edge, which Block uses by default.
const BLOCK_EDGE = 5;

const noop = () => {};

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
  const { icon, color, scale } = shapeStyles[shape];

  // Every block is a square: width x width, bottom edge included.
  const faceHeight = width - BLOCK_EDGE;

  return (
    <FatButton
      inert
      iconOnly
      size="medium"
      onPress={noop}
      icon={icon}
      iconFill={color}
      textColor={color}
      iconSize={faceHeight * scale}
      color={WOOD_FACE}
      edgeColor={WOOD_EDGE}
      height={faceHeight}
      radius={Math.round(width * 0.14)}
      style={{ width, flexShrink: 0 }}
      accessibilityLabel={`${accessibilityLabel}, ${shape} on front face`}
    />
  );
}
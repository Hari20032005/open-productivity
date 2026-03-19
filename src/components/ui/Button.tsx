import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from "react-native";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "success";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: string;
}

const variantStyles: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary: { bg: "#6366f1", text: "#ffffff" },
  secondary: { bg: "#334155", text: "#e2e8f0", border: "rgba(255,255,255,0.1)" },
  danger: { bg: "#ef4444", text: "#ffffff" },
  ghost: { bg: "transparent", text: "#a5b4fc", border: "#6366f1" },
  success: { bg: "#22c55e", text: "#ffffff" },
};

const sizeStyles: Record<Size, { py: number; px: number; fontSize: number; radius: number }> = {
  sm: { py: 8, px: 14, fontSize: 13, radius: 10 },
  md: { py: 12, px: 20, fontSize: 15, radius: 12 },
  lg: { py: 16, px: 28, fontSize: 17, radius: 14 },
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  style,
  ...props
}: ButtonProps) {
  const vs = variantStyles[variant];
  const ss = sizeStyles[size];

  const containerStyle: ViewStyle = {
    backgroundColor: vs.bg,
    paddingVertical: ss.py,
    paddingHorizontal: ss.px,
    borderRadius: ss.radius,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    ...(vs.border ? { borderWidth: 1, borderColor: vs.border } : {}),
  };

  const textStyle: TextStyle = {
    color: vs.text,
    fontSize: ss.fontSize,
    fontWeight: "600",
  };

  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      activeOpacity={0.8}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={vs.text} />
      ) : (
        <>
          {icon && <Text style={{ fontSize: ss.fontSize }}>{icon}</Text>}
          <Text style={textStyle}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

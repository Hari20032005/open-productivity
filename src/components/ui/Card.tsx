import React from "react";
import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  elevated?: boolean;
}

export function Card({ elevated, style, children, ...props }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: elevated ? "#334155" : "#1e293b",
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.06)",
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

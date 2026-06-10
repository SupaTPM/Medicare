import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

type Props = TextInputProps & {
  label: string;
};

export function TextField({ label, style, ...props }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        autoCapitalize="none"
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        placeholderTextColor="#7b8190"
        style={[styles.input, focused ? styles.focused : null, props.multiline ? styles.multiline : null, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs
  },
  label: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "700"
  },
  input: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    color: palette.text,
    fontSize: 15,
    paddingHorizontal: spacing.md
  },
  focused: {
    borderColor: palette.primaryStrong,
    shadowColor: palette.primaryStrong,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 1
  },
  multiline: {
    minHeight: 92,
    paddingTop: spacing.md,
    textAlignVertical: "top"
  }
});

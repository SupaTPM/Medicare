import React from "react";
import { Pressable, ScrollView, ScrollViewProps, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

type Props = ScrollViewProps & {
  children: React.ReactNode;
};

export function Screen({ children, contentContainerStyle, ...props }: Props) {
  const navigation = useNavigation<any>();
  const hasBack = !!navigation?.canGoBack?.();

  const goBack = () => {
    if (hasBack) {
      navigation.goBack();
    }
  };

  return (
    <LinearGradient colors={[palette.background, "#eef4ff", "#ffffff"]} locations={[0, 0.52, 1]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        {hasBack ? (
          <View style={styles.navRow}>
            <Pressable
              accessibilityLabel="Volver"
              onPress={goBack}
              style={({ pressed }) => [styles.navButton, pressed ? styles.navButtonPressed : null]}
            >
              <Ionicons color={palette.primaryStrong} name="arrow-back" size={18} />
              <Text style={styles.navText}>Atras</Text>
            </Pressable>
          </View>
        ) : null}
        <ScrollView
          contentContainerStyle={[styles.content, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          {...props}
        >
          <View>{children}</View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    backgroundColor: palette.background
  },
  safeArea: {
    flex: 1
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm
  },
  navButton: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    minWidth: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  navButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }]
  },
  navText: {
    color: palette.primaryStrong,
    fontSize: 13,
    fontWeight: "800"
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl
  }
});

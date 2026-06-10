import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AlertBox } from "@/components/AlertBox";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { SkeletonList } from "@/components/Skeleton";
import { useAppState } from "@/state/AppContext";
import { palette } from "@/theme/palette";
import { cardShadow } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";
import { AppNotification } from "@/types";

function formatNotificationDate(value: string) {
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function NotificationCard({
  notification,
  onPress
}: {
  notification: AppNotification;
  onPress: () => void;
}) {
  const unread = !notification.readAt;

  return (
    <Pressable onPress={onPress} style={[styles.notificationCard, unread ? styles.notificationUnread : null]}>
      <View style={[styles.notificationIcon, unread ? styles.notificationIconUnread : null]}>
        <Ionicons color={unread ? "#ffffff" : palette.primaryStrong} name="notifications-outline" size={18} />
      </View>
      <View style={styles.notificationCopy}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          {unread ? <View style={styles.unreadDot} /> : null}
        </View>
        <Text style={styles.notificationBody}>{notification.body}</Text>
        <Text style={styles.notificationDate}>{formatNotificationDate(notification.createdAt)}</Text>
      </View>
    </Pressable>
  );
}

export function NotificationsScreen() {
  const { alerts, appNotifications, isSyncing, markNotificationRead } = useAppState();

  return (
    <Screen contentContainerStyle={{ gap: spacing.md }}>
      <SectionTitle eyebrow="Notificaciones" title="Alertas clinicas y operativas" />
      {isSyncing ? <SkeletonList count={2} /> : null}

      {!isSyncing && appNotifications.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividad reciente</Text>
          {appNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onPress={() => void markNotificationRead(notification.id)}
            />
          ))}
        </View>
      ) : null}

      {!isSyncing && alerts.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas clínicas</Text>
          {alerts.map((item) => (
            <AlertBox item={item} key={item.id} />
          ))}
        </View>
      ) : null}

      {!isSyncing && !appNotifications.length && !alerts.length ? (
        <View style={styles.emptyCard}>
          <Ionicons color={palette.textMuted} name="checkmark-circle-outline" size={32} />
          <Text style={styles.emptyTitle}>Sin notificaciones</Text>
          <Text style={styles.emptyText}>Los recordatorios y cambios de citas aparecerán aquí.</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.lg,
    ...cardShadow
  },
  emptyText: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center"
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900"
  },
  notificationBody: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 2
  },
  notificationCard: {
    alignItems: "flex-start",
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    ...cardShadow
  },
  notificationCopy: {
    flex: 1
  },
  notificationDate: {
    color: palette.textSubtle,
    fontSize: 11,
    fontWeight: "700",
    marginTop: spacing.xs,
    textTransform: "uppercase"
  },
  notificationHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  notificationIcon: {
    alignItems: "center",
    backgroundColor: palette.primaryFaint,
    borderRadius: 12,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  notificationIconUnread: {
    backgroundColor: palette.primaryStrong
  },
  notificationTitle: {
    color: palette.text,
    flex: 1,
    fontSize: 15,
    fontWeight: "900"
  },
  notificationUnread: {
    borderColor: palette.primaryStrong
  },
  section: {
    gap: spacing.sm
  },
  sectionTitle: {
    color: palette.primaryDeep,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  unreadDot: {
    backgroundColor: palette.primaryStrong,
    borderRadius: 5,
    height: 10,
    width: 10
  }
});

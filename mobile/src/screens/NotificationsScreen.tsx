import React from "react";

import { AlertBox } from "@/components/AlertBox";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { SkeletonList } from "@/components/Skeleton";
import { useAppState } from "@/state/AppContext";

export function NotificationsScreen() {
  const { alerts, isSyncing } = useAppState();

  return (
    <Screen>
      <SectionTitle eyebrow="Notificaciones" title="Alertas clinicas y operativas" />
      {isSyncing ? <SkeletonList count={2} /> : alerts.map((item) => (
        <AlertBox item={item} key={item.id} />
      ))}
    </Screen>
  );
}

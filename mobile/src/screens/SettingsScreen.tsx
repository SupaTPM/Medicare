import React from "react";

import { AlertBox } from "@/components/AlertBox";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { useAppState } from "@/state/AppContext";

export function SettingsScreen() {
  const { logout } = useAppState();

  return (
    <Screen>
      <SectionTitle eyebrow="Configuracion" title="Seguridad y sistema" />
      <AlertBox
        item={{
          id: "audit",
          tone: "info",
          title: "Auditoria activa",
          body: "Las acciones sensibles quedan preparadas para registrarse en audit_logs."
        }}
      />
      <AlertBox
        item={{
          id: "privacy",
          tone: "warning",
          title: "Datos sensibles",
          body: "Las consultas por cedula deben usar fuentes autorizadas y consentimiento del paciente."
        }}
      />
      <PrimaryButton label="Cerrar sesion" onPress={logout} variant="secondary" />
    </Screen>
  );
}

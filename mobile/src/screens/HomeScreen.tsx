import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { AlertBox } from "@/components/AlertBox";
import { AppointmentCard } from "@/components/AppointmentCard";
import { ClinicalHeader } from "@/components/ClinicalHeader";
import { FlowCard } from "@/components/FlowCard";
import { QuickAction } from "@/components/QuickAction";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { StatusPill } from "@/components/StatusPill";
import { StatCard } from "@/components/StatCard";
import { useAppState } from "@/state/AppContext";
import { palette } from "@/theme/palette";
import { raisedShadow } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { alerts, appointments, patients, user } = useAppState();
  const nextAppointment = appointments[0];

  if (!user) {
    return null;
  }

  return (
    <Screen>
      <ClinicalHeader user={user} onNotifications={() => navigation.navigate("Notifications")} />

      {user.role === "patient" ? (
        <>
          <LinearGradient colors={[palette.primaryDeep, palette.primaryStrong, "#143f86"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.heroBadge}>
                <Ionicons color="#c4d2ff" name="calendar" size={14} />
                <Text style={styles.heroEyebrow}>Proxima cita</Text>
              </View>
              <StatusPill label="Confirmada" tone="green" />
            </View>
            <Text style={styles.heroTitle}>{nextAppointment.specialty}</Text>
            <Text style={styles.heroMeta}>
              {nextAppointment.dateLabel} | {nextAppointment.timeLabel}
            </Text>
            <View style={styles.heroFooter}>
              <View>
                <Text style={styles.heroLabel}>Profesional asignado</Text>
                <Text style={styles.heroStatus}>{nextAppointment.doctorName}</Text>
              </View>
              <View style={styles.qrMark}>
                <Ionicons color="#ffffff" name="qr-code" size={24} />
              </View>
            </View>
          </LinearGradient>
          <PrimaryButton icon="qr-code-outline" label="Ver QR de cita" onPress={() => navigation.navigate("AppointmentQR")} style={styles.heroButton} variant="ghost" />
          <SectionTitle eyebrow="Accesos" title="Gestion medica" />
          <View style={styles.grid}>
            <QuickAction icon="calendar-outline" label="Mis citas" onPress={() => navigation.navigate("Citas")} />
            <QuickAction icon="document-text-outline" label="Historial" onPress={() => navigation.navigate("Historial")} />
            <QuickAction icon="folder-open-outline" label="Documentos" onPress={() => navigation.navigate("Documentos")} />
            <QuickAction icon="person-outline" label="Perfil" onPress={() => navigation.navigate("Perfil")} tone="primary" />
          </View>
        </>
      ) : null}

      {user.role === "doctor" ? (
        <>
          <FlowCard
            icon="pulse-outline"
            meta="3 pacientes priorizados, 1 alerta clinica activa"
            status="Turno abierto"
            title="Ronda de atencion"
            tone="green"
          />
          <SectionTitle eyebrow="Agenda" title="Citas de hoy" />
          <View style={styles.grid}>
            <QuickAction icon="qr-code-outline" label="Escanear QR" onPress={() => navigation.navigate("QRScanner")} tone="primary" />
            <QuickAction icon="search-outline" label="Buscar paciente" onPress={() => navigation.navigate("Pacientes")} />
            <QuickAction icon="medkit-outline" label="Registrar atencion" onPress={() => navigation.navigate("CreateMedicalRecord")} tone="secondary" />
          </View>
          <View style={styles.list}>
            {appointments.map((item) => (
              <AppointmentCard item={item} key={item.id} onPress={() => navigation.navigate("AppointmentDetail", { appointmentId: item.id })} />
            ))}
          </View>
        </>
      ) : null}

      {user.role === "receptionist" ? (
        <>
          <FlowCard
            icon="people-outline"
            meta="Validacion de llegada, agenda y sala de espera"
            status="Recepcion"
            title="Flujo de admision"
            tone="blue"
          />
          <SectionTitle eyebrow="Operacion" title="Registro de atencion" />
          <View style={styles.grid}>
            <QuickAction icon="person-add-outline" label="Registrar paciente" onPress={() => navigation.navigate("CreatePatient")} tone="primary" />
            <QuickAction icon="calendar-outline" label="Agendar cita" onPress={() => navigation.navigate("CreateAppointment")} />
            <QuickAction icon="qr-code-outline" label="Escanear QR" onPress={() => navigation.navigate("QR")} />
            <QuickAction icon="checkmark-done-outline" label="Validar asistencia" onPress={() => navigation.navigate("QR")} tone="secondary" />
          </View>
          <View style={styles.list}>
            <SectionTitle eyebrow="Sala" title="Pacientes en espera" />
            {patients.slice(0, 2).map((patient) => (
              <AlertBox
                item={{
                  id: patient.id,
                  tone: "info",
                  title: patient.fullName,
                  body: `CI ${patient.cedula} | Proxima especialidad: ${patient.nextSpecialty ?? "Sin cita"}`
                }}
                key={patient.id}
              />
            ))}
          </View>
        </>
      ) : null}

      {user.role === "admin" ? (
        <>
          <SectionTitle eyebrow="Control" title="Dashboard operativo" />
          <View style={styles.statRow}>
            <StatCard label="Citas hoy" value="18" />
            <StatCard label="Pacientes" value="126" tone="green" />
            <StatCard label="Especialidades" value="9" tone="purple" />
          </View>
          <View style={styles.statRow}>
            <StatCard label="No show" value="2" tone="purple" />
            <StatCard label="Medicos activos" value="12" />
            <StatCard label="Alertas" value="4" tone="green" />
          </View>
          <FlowCard
            icon="analytics-outline"
            meta="Citas, pacientes, especialidades y alertas listas para reporteria"
            status="Resumen"
            title="Indicadores del dia"
            tone="yellow"
          />
        </>
      ) : null}

      <SectionTitle eyebrow="Alertas" title="Revision prioritaria" />
      {alerts.map((item) => (
        <AlertBox item={item} key={item.id} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 24,
    overflow: "hidden",
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...raisedShadow
  },
  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg
  },
  heroBadge: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  heroEyebrow: {
    color: "#c4d2ff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 29,
    fontWeight: "900",
    lineHeight: 34,
    marginBottom: spacing.sm
  },
  heroMeta: {
    color: "#dbeafe",
    fontSize: 14,
    fontWeight: "700"
  },
  heroFooter: {
    alignItems: "center",
    borderTopColor: "#ffffff26",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    paddingTop: spacing.md
  },
  heroLabel: {
    color: "#b6c8f5",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2
  },
  heroStatus: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800"
  },
  qrMark: {
    alignItems: "center",
    backgroundColor: "#ffffff1f",
    borderColor: "#ffffff33",
    borderRadius: 16,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  heroButton: {
    marginBottom: spacing.lg
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  list: {
    marginBottom: spacing.lg
  },
  statRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm
  }
});

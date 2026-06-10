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
import { HomeSkeleton, SkeletonList } from "@/components/Skeleton";
import { StatusPill } from "@/components/StatusPill";
import { StatCard } from "@/components/StatCard";
import { useAppState } from "@/state/AppContext";
import { palette } from "@/theme/palette";
import { raisedShadow } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { alerts, appointments, isSyncing, patients, user } = useAppState();
  const nextAppointment = appointments[0];

  if (!user) {
    return null;
  }

  return (
    <Screen>
      <ClinicalHeader user={user} onNotifications={() => navigation.navigate("Notifications")} />

      {isSyncing ? <HomeSkeleton /> : null}

      {!isSyncing && user.role === "patient" ? (
        <>
          <LinearGradient colors={[palette.primaryDeep, palette.primaryStrong, "#143f86"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.heroBadge}>
                <Ionicons color="#c4d2ff" name="calendar" size={14} />
                <Text style={styles.heroEyebrow}>{nextAppointment ? "Proxima cita" : "Panel del paciente"}</Text>
              </View>
              <StatusPill label={nextAppointment ? "Confirmada" : "Activo"} tone="green" />
            </View>
            <Text style={styles.heroTitle}>{nextAppointment?.specialty ?? "Gestiona tu atencion medica"}</Text>
            <Text style={styles.heroMeta}>
              {nextAppointment ? `${nextAppointment.dateLabel} | ${nextAppointment.timeLabel}` : "Agenda citas, revisa tu historial y mantén tus datos clinicos al dia."}
            </Text>
            <View style={styles.heroFooter}>
              <View>
                <Text style={styles.heroLabel}>{nextAppointment ? "Profesional asignado" : "Siguiente paso recomendado"}</Text>
                <Text style={styles.heroStatus}>{nextAppointment?.doctorName ?? "Completar informacion del perfil"}</Text>
              </View>
              <View style={styles.qrMark}>
                <Ionicons color="#ffffff" name={nextAppointment ? "qr-code" : "heart-circle"} size={24} />
              </View>
            </View>
          </LinearGradient>
          {nextAppointment ? (
            <PrimaryButton icon="qr-code-outline" label="Ver QR de cita" onPress={() => navigation.navigate("AppointmentQR")} style={styles.heroButton} variant="ghost" />
          ) : null}
          <SectionTitle eyebrow="Acciones" title="Que puedes hacer" />
          <View style={styles.grid}>
            <QuickAction icon="calendar-outline" label="Agendar y revisar citas" onPress={() => navigation.navigate("Citas")} tone="primary" />
            <QuickAction icon="document-text-outline" label="Ver historial clinico" onPress={() => navigation.navigate("Historial")} />
            <QuickAction icon="folder-open-outline" label="Consultar documentos" onPress={() => navigation.navigate("Documentos")} />
            <QuickAction icon="person-outline" label="Agregar datos utiles al perfil" onPress={() => navigation.navigate("Perfil")} tone="secondary" />
          </View>
          <View style={styles.patientBrief}>
            <View style={styles.patientBriefIcon}>
              <Ionicons color={palette.primaryStrong} name="shield-checkmark-outline" size={22} />
            </View>
            <View style={styles.patientBriefCopy}>
              <Text style={styles.patientBriefTitle}>Tu expediente se actualiza con datos reales</Text>
              <Text style={styles.patientBriefText}>
                Mantén alergias, telefono y antecedentes completos para que recepcion y doctores tengan mejor contexto.
              </Text>
            </View>
          </View>
        </>
      ) : null}

      {!isSyncing && user.role === "doctor" ? (
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
            {appointments.length ? appointments.map((item) => (
              <AppointmentCard item={item} key={item.id} onPress={() => navigation.navigate("AppointmentDetail", { appointmentId: item.id })} />
            )) : <SkeletonList count={2} />}
          </View>
        </>
      ) : null}

      {!isSyncing && user.role === "receptionist" ? (
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

      {!isSyncing && user.role === "admin" ? (
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

      {!isSyncing ? (
        <>
          <SectionTitle eyebrow="Alertas" title="Revision prioritaria" />
          {alerts.map((item) => (
            <AlertBox item={item} key={item.id} />
          ))}
        </>
      ) : null}
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
  },
  patientBrief: {
    alignItems: "flex-start",
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md
  },
  patientBriefCopy: {
    flex: 1
  },
  patientBriefIcon: {
    alignItems: "center",
    backgroundColor: palette.primaryFaint,
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  patientBriefText: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs
  },
  patientBriefTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "900"
  }
});

import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { AIAssistantScreen } from "@/screens/AIAssistantScreen";
import { AppointmentDetailScreen } from "@/screens/AppointmentDetailScreen";
import { AppointmentListScreen } from "@/screens/AppointmentListScreen";
import { CedulaAccessScreen } from "@/screens/CedulaAccessScreen";
import { CreateAppointmentScreen } from "@/screens/CreateAppointmentScreen";
import { CreateMedicalRecordScreen } from "@/screens/CreateMedicalRecordScreen";
import { CreatePatientScreen } from "@/screens/CreatePatientScreen";
import { DoctorAccessScreen } from "@/screens/DoctorAccessScreen";
import { DocumentsScreen } from "@/screens/DocumentsScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { LoginScreen } from "@/screens/LoginScreen";
import { MedicalRecordScreen } from "@/screens/MedicalRecordScreen";
import { NotificationsScreen } from "@/screens/NotificationsScreen";
import { PatientDetailScreen } from "@/screens/PatientDetailScreen";
import { PatientListScreen } from "@/screens/PatientListScreen";
import { PatientOnboardingScreen } from "@/screens/PatientOnboardingScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { PublicQRAccessScreen } from "@/screens/PublicQRAccessScreen";
import { PatientAccessScreen } from "@/screens/PatientAccessScreen";
import { QRScannerScreen } from "@/screens/QRScannerScreen";
import { QRScreen } from "@/screens/QRScreen";
import { ReportsScreen } from "@/screens/ReportsScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { UsersScreen } from "@/screens/UsersScreen";
import { useAppState } from "@/state/AppContext";
import { palette } from "@/theme/palette";
import { UserRole } from "@/types";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function iconForRoute(routeName: string): keyof typeof Ionicons.glyphMap {
  const map: Record<string, keyof typeof Ionicons.glyphMap> = {
    Inicio: "home-outline",
    Citas: "calendar-outline",
    Historial: "document-text-outline",
    Documentos: "folder-open-outline",
    Perfil: "person-outline",
    Agenda: "time-outline",
    Pacientes: "people-outline",
    AIAssistant: "sparkles-outline",
    QR: "qr-code-outline",
    Dashboard: "grid-outline",
    Usuarios: "people-circle-outline",
    Reportes: "stats-chart-outline",
    Configuracion: "settings-outline"
  };

  return map[routeName] ?? "ellipse-outline";
}

function RoleTabs({ role }: { role: UserRole }) {
  const commonOptions = {
    headerShown: false,
    tabBarActiveTintColor: palette.primaryStrong,
    tabBarInactiveTintColor: palette.textMuted,
    tabBarShowLabel: false,
    tabBarItemStyle: {
      alignItems: "center" as const,
      justifyContent: "center" as const,
      paddingVertical: 8
    },
    tabBarStyle: {
      backgroundColor: palette.surface,
      borderTopColor: palette.borderSoft,
      borderTopWidth: 1,
      elevation: 10,
      height: 68,
      paddingHorizontal: 14,
      paddingTop: 8,
      paddingBottom: 10,
      shadowColor: "#0b1f3a",
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.08,
      shadowRadius: 18
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...commonOptions,
        tabBarIcon: ({ color, focused }) => (
          <View
            style={{
              alignItems: "center",
              backgroundColor: focused ? palette.primaryFaint : "transparent",
              borderColor: focused ? palette.surfaceAccent : "transparent",
              borderRadius: 18,
              borderWidth: 1,
              height: 42,
              justifyContent: "center",
              width: 42
            }}
          >
            <Ionicons color={color} name={focused ? iconForRoute(route.name).replace("-outline", "") as keyof typeof Ionicons.glyphMap : iconForRoute(route.name)} size={focused ? 24 : 22} />
          </View>
        )
      })}
    >
      {role === "patient" ? (
        <>
          <Tab.Screen component={HomeScreen} name="Inicio" />
          <Tab.Screen component={AppointmentListScreen} name="Citas" />
          <Tab.Screen component={MedicalRecordScreen} name="Historial" />
          <Tab.Screen component={DocumentsScreen} name="Documentos" />
          <Tab.Screen component={ProfileScreen} name="Perfil" />
        </>
      ) : null}
      {role === "doctor" ? (
        <>
          <Tab.Screen component={HomeScreen} name="Inicio" />
          <Tab.Screen component={AppointmentListScreen} name="Agenda" />
          <Tab.Screen component={PatientListScreen} name="Pacientes" />
          <Tab.Screen component={AIAssistantScreen} name="AIAssistant" options={{ title: "IA" }} />
          <Tab.Screen component={ProfileScreen} name="Perfil" />
        </>
      ) : null}
      {role === "receptionist" ? (
        <>
          <Tab.Screen component={HomeScreen} name="Inicio" />
          <Tab.Screen component={PatientListScreen} name="Pacientes" />
          <Tab.Screen component={AppointmentListScreen} name="Citas" />
          <Tab.Screen component={QRScannerScreen} name="QR" />
          <Tab.Screen component={ProfileScreen} name="Perfil" />
        </>
      ) : null}
      {role === "admin" ? (
        <>
          <Tab.Screen component={HomeScreen} name="Dashboard" />
          <Tab.Screen component={UsersScreen} name="Usuarios" />
          <Tab.Screen component={ReportsScreen} name="Reportes" />
          <Tab.Screen component={SettingsScreen} name="Configuracion" />
        </>
      ) : null}
    </Tab.Navigator>
  );
}

function PatientLoadingScreen() {
  return (
    <View style={{ alignItems: "center", backgroundColor: palette.background, flex: 1, gap: 12, justifyContent: "center" }}>
      <ActivityIndicator color={palette.primaryStrong} size="large" />
      <Text style={{ color: palette.textMuted, fontSize: 14, fontWeight: "700" }}>Cargando tu ficha medica...</Text>
    </View>
  );
}

export function AppNavigator() {
  const { user, patients } = useAppState();
  const isPatient = user?.role === "patient";
  const patientProfile = isPatient ? patients[0] ?? null : null;
  const patientLoading = isPatient && patientProfile == null;
  const patientNeedsOnboarding = isPatient && patientProfile != null && !patientProfile.profileCompleted;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen component={LoginScreen} name="Login" />
          <Stack.Screen component={PatientAccessScreen} name="PatientAccess" />
          <Stack.Screen component={DoctorAccessScreen} name="DoctorAccess" />
          <Stack.Screen component={CedulaAccessScreen} name="CedulaAccess" />
          <Stack.Screen component={PublicQRAccessScreen} name="PublicQRAccess" />
        </>
      ) : patientLoading ? (
        <Stack.Screen component={PatientLoadingScreen} name="PatientLoading" />
      ) : patientNeedsOnboarding ? (
        <Stack.Screen component={PatientOnboardingScreen} name="PatientOnboarding" />
      ) : (
        <>
          <Stack.Screen name="Main">{() => <RoleTabs role={user.role} />}</Stack.Screen>
          <Stack.Screen component={AppointmentDetailScreen} name="AppointmentDetail" />
          <Stack.Screen component={CreateAppointmentScreen} name="CreateAppointment" />
          <Stack.Screen component={CreateMedicalRecordScreen} name="CreateMedicalRecord" />
          <Stack.Screen component={CreatePatientScreen} name="CreatePatient" />
          <Stack.Screen component={AIAssistantScreen} name="AIAssistantStack" />
          <Stack.Screen component={DocumentsScreen} name="PatientDocuments" />
          <Stack.Screen component={NotificationsScreen} name="Notifications" />
          <Stack.Screen component={PatientDetailScreen} name="PatientDetail" />
          <Stack.Screen component={QRScannerScreen} name="QRScanner" />
          <Stack.Screen component={QRScreen} name="AppointmentQR" />
          <Stack.Screen component={PatientOnboardingScreen} name="PatientProfileEdit" />
        </>
      )}
    </Stack.Navigator>
  );
}

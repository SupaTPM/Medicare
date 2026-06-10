import {
  AlertItem,
  Appointment,
  MedicalDocument,
  MedicalRecord,
  Patient,
  UserProfile
} from "@/types";

export const mockUsers: UserProfile[] = [
  { id: "u1", name: "Justin Zambrano", email: "paciente@medflow.test", role: "patient", subtitle: "Paciente" },
  { id: "u2", name: "Dr. Alejandro Solis", email: "doctor@medflow.test", role: "doctor", subtitle: "Cardiologia" },
  { id: "u5", name: "Dra. Elena Mera", email: "elena@medflow.test", role: "doctor", subtitle: "Pediatria" },
  { id: "u6", name: "Dr. Luis Mendoza", email: "luis@medflow.test", role: "doctor", subtitle: "Medicina general" },
  { id: "u3", name: "Camila Vera", email: "recepcion@medflow.test", role: "receptionist", subtitle: "Recepcion" },
  { id: "u4", name: "Ana Torres", email: "admin@medflow.test", role: "admin", subtitle: "Administracion" }
];

export const mockCredentials = [
  { email: "paciente@medflow.test", password: "password123", userId: "u1" },
  { email: "doctor@medflow.test", password: "password123", userId: "u2" },
  { email: "elena@medflow.test", password: "password123", userId: "u5" },
  { email: "luis@medflow.test", password: "password123", userId: "u6" },
  { email: "recepcion@medflow.test", password: "password123", userId: "u3" },
  { email: "admin@medflow.test", password: "password123", userId: "u4" }
];

export const mockDoctorProfiles = mockUsers.filter((item) => item.role === "doctor");

export const mockPatients: Patient[] = [
  {
    id: "p1",
    fullName: "Justin Zambrano",
    cedula: "1312345678",
    age: 22,
    bloodType: "O+",
    allergies: ["Ninguna registrada"],
    phone: "0991234567",
    lastVisit: "12/05/2026",
    nextSpecialty: "Medicina general"
  },
  {
    id: "p2",
    fullName: "Maria Fernanda Lopez",
    cedula: "0911122233",
    age: 34,
    bloodType: "A+",
    allergies: ["Penicilina"],
    phone: "0981112233",
    lastVisit: "20/05/2026",
    nextSpecialty: "Cardiologia"
  },
  {
    id: "p3",
    fullName: "Carlos Vera",
    cedula: "0922233344",
    age: 57,
    bloodType: "B+",
    allergies: ["Dipirona"],
    phone: "0974567890",
    lastVisit: "28/05/2026",
    nextSpecialty: "Medicina interna"
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: "a1",
    patientName: "Justin Zambrano",
    doctorName: "Dr. Luis Mendoza",
    specialty: "Cardiologia",
    dateLabel: "Viernes 12 Junio 2026",
    timeLabel: "10:30 AM",
    status: "confirmed",
    reason: "Control cardiologico",
    qrCode: "APT-2026-0001"
  },
  {
    id: "a2",
    patientName: "Maria Zambrano",
    doctorName: "Dr. Alejandro Solis",
    specialty: "Medicina general",
    dateLabel: "Hoy",
    timeLabel: "08:00 AM",
    status: "confirmed",
    reason: "Chequeo general",
    qrCode: "APT-2026-0002"
  },
  {
    id: "a3",
    patientName: "Carlos Vera",
    doctorName: "Dr. Alejandro Solis",
    specialty: "Seguimiento",
    dateLabel: "Hoy",
    timeLabel: "09:00 AM",
    status: "waiting",
    reason: "Revision de signos vitales",
    qrCode: "APT-2026-0003"
  }
];

export const mockRecords: MedicalRecord[] = [
  {
    id: "r1",
    patientId: "p2",
    dateLabel: "20/05/2026",
    diagnosis: "Hipertension controlada",
    treatment: "Ajuste de dosis y seguimiento",
    vitalSigns: "PA 140/90, Temp 36.7, Peso 68kg",
    notes: "Evitar penicilina, control mensual."
  },
  {
    id: "r2",
    patientId: "p3",
    dateLabel: "28/05/2026",
    diagnosis: "Dolor toracico en estudio",
    treatment: "Observacion y electrocardiograma",
    vitalSigns: "PA 150/95, Temp 36.8, Peso 81kg",
    notes: "Revisar tension arterial antes de medicar."
  }
];

export const mockDocuments: MedicalDocument[] = [
  {
    id: "d1",
    patientId: "p2",
    title: "Examen de laboratorio",
    type: "PDF",
    dateLabel: "21/05/2026",
    uploadedBy: "Dr. Alejandro Solis"
  },
  {
    id: "d2",
    patientId: "p2",
    title: "Radiografia torax",
    type: "Imagen",
    dateLabel: "25/05/2026",
    uploadedBy: "Dra. Elena Solis"
  }
];

export const mockAlerts: AlertItem[] = [
  {
    id: "al1",
    tone: "danger",
    title: "Alergia registrada",
    body: "Paciente con alergia a penicilina. Revisar antes de prescribir."
  },
  {
    id: "al2",
    tone: "warning",
    title: "Seguimiento pendiente",
    body: "Carlos Vera presenta tendencia de presion alta en los ultimos controles."
  }
];

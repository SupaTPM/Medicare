import { apiRequest } from "@/services/api";
import {
  AlertItem,
  Appointment,
  AppointmentStatus,
  MedicalDocument,
  MedicalRecord,
  Patient,
  UserProfile,
  UserRole
} from "@/types";

type Paginated<T> = {
  data: T[];
};

type ApiUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

type ApiPatient = {
  id: number;
  full_name: string;
  cedula: string;
  birth_date?: string | null;
  blood_type?: string | null;
  phone?: string | null;
  allergies?: string[] | null;
  created_at?: string;
  updated_at?: string;
};

type ApiAppointment = {
  id: number;
  patient_id: number;
  doctor_id?: number | null;
  specialty: string;
  scheduled_at: string;
  reason: string;
  observations?: string | null;
  status: AppointmentStatus;
  patient?: ApiPatient;
  qr_token?: { token: string } | null;
};

type ApiMedicalRecord = {
  id: number;
  patient_id: number;
  created_at?: string;
  diagnosis: string;
  treatment?: string | null;
  recommendations?: string | null;
  blood_pressure?: string | null;
  temperature?: string | number | null;
  weight?: string | number | null;
  height?: string | number | null;
};

type ApiMedicalDocument = {
  id: number;
  patient_id: number;
  title: string;
  document_type: string;
  uploaded_at?: string | null;
  uploaded_by?: number;
};

export type LoginResponse = {
  token: string;
  user: ApiUser;
};

export type CreatePatientPayload = {
  full_name: string;
  cedula: string;
  birth_date?: string;
  sex?: string;
  blood_type?: string;
  phone?: string;
  allergies?: string[];
  previous_conditions?: string[];
};

export type CreateAppointmentPayload = {
  patient_id: number;
  doctor_id?: number;
  specialty: string;
  scheduled_at: string;
  reason: string;
  status?: AppointmentStatus;
};

export type CreateMedicalRecordPayload = {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  consultation_reason: string;
  symptoms?: string;
  blood_pressure?: string;
  temperature?: number;
  weight?: number;
  height?: number;
  diagnosis: string;
  treatment?: string;
  recommendations?: string;
};

function formatDate(value?: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function formatTime(value?: string | null) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("es-EC", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function calculateAge(value?: string | null) {
  if (!value) {
    return 0;
  }

  const birthDate = new Date(value);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return Math.max(age, 0);
}

export function mapUser(user: ApiUser): UserProfile {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    subtitle: user.role
  };
}

export function mapPatient(patient: ApiPatient): Patient {
  return {
    id: String(patient.id),
    fullName: patient.full_name,
    cedula: patient.cedula,
    age: calculateAge(patient.birth_date),
    bloodType: patient.blood_type ?? "No registrado",
    allergies: patient.allergies?.length ? patient.allergies : ["Sin alergias registradas"],
    phone: patient.phone ?? "No registrado",
    lastVisit: formatDate(patient.updated_at ?? patient.created_at),
    nextSpecialty: undefined
  };
}

export function mapAppointment(appointment: ApiAppointment, users: UserProfile[] = []): Appointment {
  const doctor = users.find((item) => item.id === String(appointment.doctor_id));

  return {
    id: String(appointment.id),
    patientName: appointment.patient?.full_name ?? `Paciente #${appointment.patient_id}`,
    doctorName: doctor?.name ?? "Doctor pendiente",
    specialty: appointment.specialty,
    dateLabel: formatDate(appointment.scheduled_at),
    timeLabel: formatTime(appointment.scheduled_at),
    status: appointment.status,
    reason: appointment.reason,
    qrCode: appointment.qr_token?.token ?? `APT-${appointment.id}`
  };
}

export function mapMedicalRecord(record: ApiMedicalRecord): MedicalRecord {
  const vitalSigns = [
    record.blood_pressure ? `PA ${record.blood_pressure}` : null,
    record.temperature ? `Temp ${record.temperature}` : null,
    record.weight ? `Peso ${record.weight}` : null,
    record.height ? `Altura ${record.height}` : null
  ].filter(Boolean);

  return {
    id: String(record.id),
    patientId: String(record.patient_id),
    dateLabel: formatDate(record.created_at),
    diagnosis: record.diagnosis,
    treatment: record.treatment ?? "Sin tratamiento registrado",
    vitalSigns: vitalSigns.join(", ") || "Sin signos vitales",
    notes: record.recommendations ?? "Sin recomendaciones"
  };
}

export function mapMedicalDocument(document: ApiMedicalDocument): MedicalDocument {
  return {
    id: String(document.id),
    patientId: String(document.patient_id),
    title: document.title,
    type: document.document_type,
    dateLabel: formatDate(document.uploaded_at),
    uploadedBy: document.uploaded_by ? `Usuario #${document.uploaded_by}` : "No registrado"
  };
}

export async function loginRequest(email: string, password: string) {
  const response = await apiRequest<LoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

  return {
    token: response.token,
    user: mapUser(response.user)
  };
}

export async function loadUsers(token: string) {
  const users = await apiRequest<ApiUser[]>("/users", { token });
  return users.map(mapUser);
}

export async function loadPatients(token: string) {
  const response = await apiRequest<Paginated<ApiPatient>>("/patients", { token });
  return response.data.map(mapPatient);
}

export async function loadAppointments(token: string, users: UserProfile[]) {
  const response = await apiRequest<Paginated<ApiAppointment>>("/appointments", { token });
  return response.data.map((appointment) => mapAppointment(appointment, users));
}

export async function loadPatientRecords(token: string, patientId: string) {
  const records = await apiRequest<ApiMedicalRecord[]>(`/patients/${patientId}/medical-records`, { token });
  return records.map(mapMedicalRecord);
}

export async function loadPatientDocuments(token: string, patientId: string) {
  const documents = await apiRequest<ApiMedicalDocument[]>(`/patients/${patientId}/documents`, { token });
  return documents.map(mapMedicalDocument);
}

export async function createPatientRequest(token: string, payload: CreatePatientPayload) {
  const patient = await apiRequest<ApiPatient>("/patients", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });

  return mapPatient(patient);
}

export async function createAppointmentRequest(token: string, payload: CreateAppointmentPayload, users: UserProfile[]) {
  const appointment = await apiRequest<ApiAppointment>("/appointments", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });

  await apiRequest(`/appointments/${appointment.id}/generate-qr`, {
    method: "POST",
    token
  });

  return mapAppointment(appointment, users);
}

export async function createMedicalRecordRequest(token: string, payload: CreateMedicalRecordPayload) {
  const record = await apiRequest<ApiMedicalRecord>("/medical-records", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });

  return mapMedicalRecord(record);
}

export function buildAlerts(patients: Patient[]): AlertItem[] {
  return patients
    .filter((patient) => patient.allergies.some((allergy) => allergy !== "Sin alergias registradas"))
    .map((patient) => ({
      id: `allergy-${patient.id}`,
      tone: "danger" as const,
      title: "Alergia registrada",
      body: `${patient.fullName}: ${patient.allergies.join(", ")}`
    }));
}

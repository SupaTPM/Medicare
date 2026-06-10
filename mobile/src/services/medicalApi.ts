import { API_URL, apiMultipartRequest, apiRequest } from "@/services/api";
import {
  AlertItem,
  Appointment,
  AppointmentStatus,
  AvailabilitySlot,
  DoctorOption,
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
  profile_completed?: boolean;
  doctor_profile?: {
    specialty: string;
    license_code?: string | null;
    phone?: string | null;
    profile_photo_url?: string | null;
    bio?: string | null;
    education?: string | null;
    experience_years?: number | null;
    languages?: string[] | null;
  } | null;
};

type ApiPatient = {
  id: number;
  full_name: string;
  cedula: string;
  birth_date?: string | null;
  blood_type?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  allergies?: string[] | null;
  chronic_conditions?: string[] | null;
  has_disability?: boolean | null;
  disability_type?: string | null;
  disability_percentage?: number | null;
  profile_completed_at?: string | null;
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
  availability_slot_id?: number | null;
  patient?: ApiPatient;
  doctor?: ApiUser;
  qr_token?: { token: string } | null;
};

type ApiAvailabilitySlot = {
  id: number;
  doctor_id: number;
  starts_at: string;
  ends_at: string;
  status: AvailabilitySlot["status"];
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

type ApiAuthSession = {
  token: string;
  user: ApiUser;
  patient?: ApiPatient;
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

export type CompletePatientProfilePayload = {
  full_name: string;
  phone: string;
  email?: string;
  address: string;
  blood_type: string;
  allergies?: string[];
  chronic_conditions?: string[];
  has_disability: boolean;
  disability_type?: string;
  disability_percentage?: number;
};

export type CreateAppointmentPayload = {
  patient_id: number;
  doctor_id?: number;
  availability_slot_id?: number;
  specialty: string;
  scheduled_at?: string;
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

export type UpdateDoctorProfilePayload = {
  specialty: string;
  license_code: string;
  phone: string;
  bio: string;
  education: string;
  experience_years: number;
  languages: string[];
  profilePhoto?: {
    uri: string;
    name: string;
    type: string;
  };
};

async function appendUploadFile(formData: FormData, fieldName: string, file: NonNullable<UpdateDoctorProfilePayload["profilePhoto"]>) {
  if (file.uri.startsWith("blob:") || file.uri.startsWith("data:")) {
    const response = await fetch(file.uri);
    const blob = await response.blob();

    if (typeof File !== "undefined") {
      formData.append(fieldName, new File([blob], file.name, { type: file.type }));
      return;
    }

    formData.append(fieldName, blob, file.name);
    return;
  }

  formData.append(fieldName, file as unknown as Blob);
}

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

function normalizeMediaUrl(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const apiOrigin = API_URL.replace(/\/api$/, "");

  if (value.startsWith("/")) {
    return `${apiOrigin}${value}`;
  }

  return value.replace(/^http:\/\/(localhost|127\.0\.0\.1):8000/, apiOrigin);
}

export function mapUser(user: ApiUser): UserProfile {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    subtitle: user.doctor_profile?.specialty ?? user.role,
    specialty: user.doctor_profile?.specialty,
    profilePhotoUrl: normalizeMediaUrl(user.doctor_profile?.profile_photo_url),
    licenseCode: user.doctor_profile?.license_code ?? undefined,
    phone: user.doctor_profile?.phone ?? undefined,
    bio: user.doctor_profile?.bio ?? undefined,
    education: user.doctor_profile?.education ?? undefined,
    experienceYears: user.doctor_profile?.experience_years ?? undefined,
    languages: user.doctor_profile?.languages ?? [],
    doctorProfileCompleted: user.profile_completed
  };
}

function mapDoctor(user: ApiUser): DoctorOption {
  return {
    ...mapUser(user),
    specialty: user.doctor_profile?.specialty ?? "Sin especialidad",
    licenseCode: user.doctor_profile?.license_code ?? undefined,
    phone: user.doctor_profile?.phone ?? undefined,
    bio: user.doctor_profile?.bio ?? undefined,
    education: user.doctor_profile?.education ?? undefined,
    experienceYears: user.doctor_profile?.experience_years ?? undefined,
    languages: user.doctor_profile?.languages ?? [],
    profilePhotoUrl: normalizeMediaUrl(user.doctor_profile?.profile_photo_url)
  };
}

function mapAvailabilitySlot(slot: ApiAvailabilitySlot): AvailabilitySlot {
  const dateLabel = formatDate(slot.starts_at);
  const startTime = formatTime(slot.starts_at);
  const endTime = formatTime(slot.ends_at);

  return {
    id: String(slot.id),
    doctorId: String(slot.doctor_id),
    startsAt: slot.starts_at,
    endsAt: slot.ends_at,
    status: slot.status,
    label: `${dateLabel} · ${startTime} - ${endTime}`
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
    chronicConditions: patient.chronic_conditions ?? [],
    phone: patient.phone ?? "No registrado",
    email: patient.email ?? "",
    address: patient.address ?? "",
    hasDisability: Boolean(patient.has_disability),
    disabilityType: patient.disability_type ?? undefined,
    disabilityPercentage: patient.disability_percentage ?? undefined,
    lastVisit: formatDate(patient.updated_at ?? patient.created_at),
    nextSpecialty: undefined,
    profileCompleted: Boolean(patient.profile_completed_at)
  };
}

export function mapAppointment(appointment: ApiAppointment, users: UserProfile[] = []): Appointment {
  const doctor = users.find((item) => item.id === String(appointment.doctor_id)) ?? (appointment.doctor ? mapUser(appointment.doctor) : null);

  return {
    id: String(appointment.id),
    doctorId: appointment.doctor_id ? String(appointment.doctor_id) : appointment.doctor ? String(appointment.doctor.id) : undefined,
    patientName: appointment.patient?.full_name ?? `Paciente #${appointment.patient_id}`,
    doctorName: doctor?.name ?? "Doctor pendiente",
    doctorPhotoUrl: doctor?.profilePhotoUrl,
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

export async function registerDevicePatientRequest(cedula: string, fullName: string) {
  const response = await apiRequest<ApiAuthSession>("/patients/device-registration", {
    method: "POST",
    body: JSON.stringify({ cedula, full_name: fullName, source: "mobile_device" })
  });

  return {
    token: response.token,
    user: mapUser(response.user),
    patient: response.patient ? mapPatient(response.patient) : null
  };
}

export async function loginWithCedulaRequest(cedula: string) {
  const response = await apiRequest<ApiAuthSession>("/patients/cedula-login", {
    method: "POST",
    body: JSON.stringify({ cedula })
  });

  return {
    token: response.token,
    user: mapUser(response.user),
    patient: response.patient ? mapPatient(response.patient) : null
  };
}

export async function loadCurrentPatient(token: string) {
  const patient = await apiRequest<ApiPatient>("/me/patient", { token });
  return mapPatient(patient);
}

export async function completePatientProfileRequest(token: string, payload: CompletePatientProfilePayload) {
  const patient = await apiRequest<ApiPatient>("/me/patient", {
    method: "PUT",
    token,
    body: JSON.stringify(payload)
  });

  return mapPatient(patient);
}

export async function loadUsers(token: string) {
  const users = await apiRequest<ApiUser[]>("/users", { token });
  return users.map(mapUser);
}

export async function loadScheduleSpecialties(token: string) {
  return apiRequest<string[]>("/schedule/specialties", token ? { token } : {});
}

export async function loadScheduleDoctors(token: string, specialty: string) {
  const doctors = await apiRequest<ApiUser[]>(
    `/schedule/doctors?specialty=${encodeURIComponent(specialty)}`,
    token ? { token } : {}
  );
  return doctors.map(mapDoctor);
}

export async function loadDoctorProfile(token: string, doctorId: string) {
  const doctor = await apiRequest<ApiUser>(
    `/schedule/doctors/${doctorId}/profile`,
    token ? { token } : {}
  );

  return mapDoctor(doctor);
}

export async function updateDoctorProfileRequest(token: string, doctorId: string, payload: UpdateDoctorProfilePayload) {
  const formData = new FormData();

  formData.append("specialty", payload.specialty);
  formData.append("license_code", payload.license_code);
  formData.append("phone", payload.phone);
  formData.append("bio", payload.bio);
  formData.append("education", payload.education);
  formData.append("experience_years", String(payload.experience_years));

  payload.languages.forEach((language, index) => {
    formData.append(`languages[${index}]`, language);
  });

  if (payload.profilePhoto) {
    await appendUploadFile(formData, "profile_photo", payload.profilePhoto);
  }

  const doctor = await apiMultipartRequest<ApiUser>(`/doctors/${doctorId}/profile`, formData, token);
  return mapDoctor(doctor);
}

export async function loadDoctorAvailability(token: string, doctorId: string) {
  const slots = await apiRequest<ApiAvailabilitySlot[]>(
    `/schedule/doctors/${doctorId}/availability`,
    token ? { token } : {}
  );
  return slots.map(mapAvailabilitySlot);
}

export async function loadPatients(token: string) {
  const response = await apiRequest<Paginated<ApiPatient>>("/patients", { token });
  return response.data.map(mapPatient);
}

export async function searchPatients(token: string, query: string) {
  const patients = await apiRequest<ApiPatient[]>(`/patients/search?query=${encodeURIComponent(query)}`, { token });
  return patients.map(mapPatient);
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

export async function createPublicAppointmentRequest(payload: CreateAppointmentPayload, users: UserProfile[]) {
  const appointment = await apiRequest<ApiAppointment>("/appointments/public", {
    method: "POST",
    body: JSON.stringify(payload)
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

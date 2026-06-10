export type UserRole = "patient" | "doctor" | "receptionist" | "admin";

export type SyncStatus = "pending" | "synced" | "failed";
export type DoctorRequestStatus = "pending" | "approved" | "rejected";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "waiting"
  | "in_consultation"
  | "completed"
  | "cancelled"
  | "no_show";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subtitle: string;
  specialty?: string;
};

export type DoctorOption = UserProfile & {
  specialty: string;
};

export type AvailabilitySlot = {
  id: string;
  doctorId: string;
  startsAt: string;
  endsAt: string;
  status: "available" | "booked" | "completed" | "cancelled";
  label: string;
};

export type DevicePatientRegistration = {
  id: string;
  cedula: string;
  fullName: string;
  createdAt: string;
  syncStatus: SyncStatus;
  lastSyncAttemptAt?: string;
  remoteId?: string;
};

export type DeviceDoctorRegistration = {
  id: string;
  fullName: string;
  email: string;
  specialty: string;
  cedula: string;
  phone: string;
  licenseCode?: string;
  createdAt: string;
  status: DoctorRequestStatus;
};

export type Patient = {
  id: string;
  fullName: string;
  cedula: string;
  age: number;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  phone: string;
  email: string;
  address: string;
  hasDisability: boolean;
  disabilityType?: string;
  disabilityPercentage?: number;
  lastVisit: string;
  nextSpecialty?: string;
  profileCompleted: boolean;
};

export type Appointment = {
  id: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  dateLabel: string;
  timeLabel: string;
  status: AppointmentStatus;
  reason: string;
  qrCode: string;
};

export type MedicalRecord = {
  id: string;
  patientId: string;
  dateLabel: string;
  diagnosis: string;
  treatment: string;
  vitalSigns: string;
  notes: string;
};

export type MedicalDocument = {
  id: string;
  patientId: string;
  title: string;
  type: string;
  dateLabel: string;
  uploadedBy: string;
};

export type AlertItem = {
  id: string;
  tone: "warning" | "danger" | "info";
  title: string;
  body: string;
};

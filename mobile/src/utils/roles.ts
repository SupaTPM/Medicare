import { UserProfile, UserRole } from "@/types";

export const STAFF_ROLES: UserRole[] = ["doctor", "receptionist", "admin"];

export function isStaff(user?: Pick<UserProfile, "role"> | null): boolean {
  return Boolean(user && STAFF_ROLES.includes(user.role));
}

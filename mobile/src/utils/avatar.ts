const PLACEHOLDER_COUNT = 70;

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getDoctorPlaceholderPhoto(seed: string): string {
  const index = (hashSeed(seed) % PLACEHOLDER_COUNT) + 1;
  return `https://i.pravatar.cc/150?img=${index}`;
}

export function getDoctorPhotoUri(doctor: { id?: string; name?: string; profilePhotoUrl?: string | null }): string {
  if (doctor.profilePhotoUrl) {
    return doctor.profilePhotoUrl;
  }
  return getDoctorPlaceholderPhoto(doctor.id || doctor.name || "doctor");
}

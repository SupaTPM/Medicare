import { AppointmentStatus } from "@/types";
import { palette } from "@/theme/palette";

export function getStatusColors(status: AppointmentStatus) {
  switch (status) {
    case "confirmed":
      return { bg: "#E6F4EA", fg: palette.secondary };
    case "waiting":
      return { bg: "#DBEAFE", fg: palette.primaryStrong };
    case "completed":
      return { bg: "#DCFCE7", fg: palette.secondary };
    case "cancelled":
    case "no_show":
      return { bg: palette.dangerSoft, fg: palette.danger };
    case "in_consultation":
      return { bg: "#FEF3C7", fg: "#92400E" };
    default:
      return { bg: palette.surfaceAccent, fg: palette.textMuted };
  }
}

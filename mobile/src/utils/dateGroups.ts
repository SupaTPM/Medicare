function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getDayDifference(iso: string): number {
  return Math.round((startOfDay(new Date(iso)) - startOfDay(new Date())) / 86400000);
}

export function getRelativeDayLabel(iso: string): string {
  const diff = getDayDifference(iso);

  if (diff === 0) {
    return "Hoy";
  }
  if (diff === 1) {
    return "Mañana";
  }
  if (diff === -1) {
    return "Ayer";
  }
  if (diff > 1 && diff < 7) {
    return capitalize(new Intl.DateTimeFormat("es-EC", { weekday: "long" }).format(new Date(iso)));
  }

  return capitalize(new Intl.DateTimeFormat("es-EC", { day: "numeric", month: "long" }).format(new Date(iso)));
}

export function getCountdownLabel(iso: string): string {
  const diff = getDayDifference(iso);

  if (diff === 0) {
    return "Hoy";
  }
  if (diff === 1) {
    return "Mañana";
  }
  if (diff > 1) {
    return `En ${diff} días`;
  }

  return getRelativeDayLabel(iso);
}

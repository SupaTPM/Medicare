import { AvailabilitySlot } from "@/types";

export type SlotDayGroup = {
  date: string;
  dayLabel: string;
  dayNumber: string;
  slots: AvailabilitySlot[];
};

function toDateKey(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dayLabelFor(value: string) {
  const date = new Date(value);
  const label = new Intl.DateTimeFormat("es-EC", { weekday: "short" }).format(date);
  const capitalized = label.charAt(0).toUpperCase() + label.slice(1);
  return capitalized.replace(".", "").slice(0, 3);
}

function dayNumberFor(value: string) {
  const date = new Date(value);
  return String(date.getDate());
}

export function groupSlotsByDay(slots: AvailabilitySlot[]): SlotDayGroup[] {
  const sorted = [...slots].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const groups = new Map<string, SlotDayGroup>();

  for (const slot of sorted) {
    const date = toDateKey(slot.startsAt);

    if (!groups.has(date)) {
      groups.set(date, {
        date,
        dayLabel: dayLabelFor(slot.startsAt),
        dayNumber: dayNumberFor(slot.startsAt),
        slots: []
      });
    }

    groups.get(date)!.slots.push(slot);
  }

  return Array.from(groups.values()).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

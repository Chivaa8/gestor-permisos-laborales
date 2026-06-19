// ponytail: calendario oficial 2026; añadir el nuevo año cuando se publique el calendario de Barcelona.
const FESTIVOS_2026 = new Set([
  "2026-01-01", "2026-01-06",
  "2026-04-03", "2026-04-06",
  "2026-05-01", "2026-05-25",
  "2026-06-24",
  "2026-08-15",
  "2026-09-11", "2026-09-24",
  "2026-10-12",
  "2026-12-08", "2026-12-25", "2026-12-26",
]);

export function esLaborableBarcelona(date: string): boolean {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day !== 0 && day !== 6 && !FESTIVOS_2026.has(date);
}

export function esFestivoBarcelona(date: string): boolean {
  return FESTIVOS_2026.has(date);
}

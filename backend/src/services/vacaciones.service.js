export const LIMITES_VACACIONES = Object.freeze({
  vacaciones: 25,
  personales: 3,
  no_retribuidos: 7,
});

export function calcularDiasInclusivos(fechaInicio, fechaFin) {
  const inicio = fechaIso(fechaInicio);
  const fin = fechaIso(fechaFin);
  if (!inicio || !fin || fin < inicio) return 0;

  let dias = 0;
  for (const date = new Date(`${inicio}T00:00:00Z`); date <= new Date(`${fin}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + 1)) {
    if (esLaborableBarcelona(date)) dias += 1;
  }
  return dias;
}

export function sonTiposIncompatibles(tipoA, tipoB) {
  return new Set([tipoA, tipoB]).size === 2
    && [tipoA, tipoB].every((tipo) => ["vacaciones", "no_retribuidos"].includes(tipo));
}

export function crearSaldo(vacaciones = []) {
  const saldo = Object.fromEntries(
    Object.entries(LIMITES_VACACIONES).map(([tipo, total]) => [
      tipo,
      { total, aprobados: 0, pendientes: 0, disponibles: total },
    ]),
  );

  for (const solicitud of vacaciones) {
    if (!saldo[solicitud.tipo] || !["aprobado", "pendiente"].includes(solicitud.estado)) {
      continue;
    }

    const campo = solicitud.estado === "aprobado" ? "aprobados" : "pendientes";
    saldo[solicitud.tipo][campo] += solicitud.fechaInicio && solicitud.fechaFin
      ? calcularDiasInclusivos(solicitud.fechaInicio, solicitud.fechaFin)
      : solicitud.dias;
  }

  for (const tipo of Object.keys(saldo)) {
    saldo[tipo].disponibles = Math.max(
      saldo[tipo].total - saldo[tipo].aprobados - saldo[tipo].pendientes,
      0,
    );
  }

  return saldo;
}
import { esLaborableBarcelona, fechaIso } from "./festivos.service.js";

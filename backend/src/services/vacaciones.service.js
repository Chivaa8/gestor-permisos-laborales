export const LIMITES_VACACIONES = Object.freeze({
  vacaciones: 25,
  personales: 3,
  no_retribuidos: 7,
});

export function calcularDiasInclusivos(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    return 0;
  }

  const inicioUtc = Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth(), inicio.getUTCDate());
  const finUtc = Date.UTC(fin.getUTCFullYear(), fin.getUTCMonth(), fin.getUTCDate());
  return Math.floor((finUtc - inicioUtc) / 86_400_000) + 1;
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
    saldo[solicitud.tipo][campo] += solicitud.dias;
  }

  for (const tipo of Object.keys(saldo)) {
    saldo[tipo].disponibles = Math.max(
      saldo[tipo].total - saldo[tipo].aprobados - saldo[tipo].pendientes,
      0,
    );
  }

  return saldo;
}

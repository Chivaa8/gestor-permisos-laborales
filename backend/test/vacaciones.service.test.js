import assert from "node:assert/strict";
import test from "node:test";
import { calcularDiasInclusivos, crearSaldo, sonTiposIncompatibles } from "../src/services/vacaciones.service.js";

test("calcularDiasInclusivos cuenta solo laborables de Barcelona", () => {
  assert.equal(calcularDiasInclusivos("2026-08-03", "2026-08-07"), 5);
  assert.equal(calcularDiasInclusivos("2026-08-07", "2026-08-10"), 2);
  assert.equal(calcularDiasInclusivos("2026-09-24", "2026-09-24"), 0);
});

test("crearSaldo separa dias aprobados y pendientes", () => {
  const saldo = crearSaldo([
    { tipo: "vacaciones", estado: "aprobado", dias: 5 },
    { tipo: "vacaciones", estado: "pendiente", dias: 2 },
    { tipo: "personales", estado: "rechazado", dias: 1 },
  ]);

  assert.deepEqual(saldo.vacaciones, { total: 25, aprobados: 5, pendientes: 2, disponibles: 18 });
  assert.deepEqual(saldo.personales, { total: 3, aprobados: 0, pendientes: 0, disponibles: 3 });
});

test("sonTiposIncompatibles bloquea vacaciones con no retribuidos", () => {
  assert.equal(sonTiposIncompatibles("vacaciones", "no_retribuidos"), true);
  assert.equal(sonTiposIncompatibles("vacaciones", "personales"), false);
});

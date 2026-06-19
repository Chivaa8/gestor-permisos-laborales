import mongoose from "mongoose";
import Empleado from "../models/employee.model.js";
import Vacacion from "../schemas/vacacion.schema.js";
import { sendVacationApprovedEmail } from "../services/mail.service.js";
import { crearNotificacion } from "../services/notificaciones.service.js";
import {
  calcularDiasInclusivos,
  crearSaldo,
  LIMITES_VACACIONES,
  sonTiposIncompatibles,
} from "../services/vacaciones.service.js";

function inicioYFinDeAno(year) {
  return {
    desde: new Date(Date.UTC(year, 0, 1)),
    hasta: new Date(Date.UTC(year + 1, 0, 1)),
  };
}

function anoSolicitado(value) {
  const year = Number(value) || new Date().getUTCFullYear();
  return Math.min(Math.max(year, 2000), 2200);
}

async function saldoEmpleado(empId, year) {
  const { desde, hasta } = inicioYFinDeAno(year);
  const solicitudes = await Vacacion.find({
    empId,
    fechaInicio: { $gte: desde, $lt: hasta },
    estado: { $in: ["pendiente", "aprobado"] },
  }).lean();
  return crearSaldo(solicitudes);
}

class VacacionesController {
  crear = async (req, res) => {
    try {
      const { fechaInicio, fechaFin, tipo, comentario } = req.body;
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      const hoy = new Date();
      hoy.setUTCHours(0, 0, 0, 0);

      if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
        return res.status(400).json({ error: "Las fechas no son validas" });
      }
      if (!Object.hasOwn(LIMITES_VACACIONES, tipo)) {
        return res.status(400).json({ error: "Tipo de vacaciones no valido" });
      }
      if (inicio < hoy || fin < hoy) {
        return res.status(400).json({ error: "Las fechas no pueden ser anteriores a hoy" });
      }
      if (fin < inicio) {
        return res.status(400).json({ error: "La fecha final no puede ser anterior a la inicial" });
      }
      if (inicio.getUTCFullYear() !== fin.getUTCFullYear()) {
        return res.status(400).json({ error: "La solicitud debe estar dentro del mismo ano" });
      }

      const dias = calcularDiasInclusivos(inicio, fin);
      if (!dias) {
        return res.status(400).json({ error: "El periodo no contiene dias laborables" });
      }
      const year = inicio.getUTCFullYear();
      const saldo = await saldoEmpleado(req.user.id, year);
      if (dias > saldo[tipo].disponibles) {
        return res.status(400).json({
          error: `Solo quedan ${saldo[tipo].disponibles} dias disponibles para este tipo`,
        });
      }

      const solapada = await Vacacion.exists({
        empId: req.user.id,
        estado: { $in: ["pendiente", "aprobado"] },
        fechaInicio: { $lte: fin },
        fechaFin: { $gte: inicio },
      });
      if (solapada) {
        return res.status(409).json({ error: "Ya existe una solicitud activa en esas fechas" });
      }

      if (["vacaciones", "no_retribuidos"].includes(tipo)) {
        const diaAntes = new Date(inicio);
        diaAntes.setUTCDate(diaAntes.getUTCDate() - 1);
        const diaDespues = new Date(fin);
        diaDespues.setUTCDate(diaDespues.getUTCDate() + 1);
        const tipoIncompatible = tipo === "vacaciones" ? "no_retribuidos" : "vacaciones";
        const acumulada = sonTiposIncompatibles(tipo, tipoIncompatible) && await Vacacion.exists({
          empId: req.user.id,
          tipo: tipoIncompatible,
          estado: { $in: ["pendiente", "aprobado"] },
          fechaInicio: { $lte: diaDespues },
          fechaFin: { $gte: diaAntes },
        });

        if (acumulada) {
          return res.status(409).json({
            error: "No se pueden juntar dias de vacaciones con dias no retribuidos",
          });
        }
      }

      const vacacion = await Vacacion.create({
        empId: req.user.id,
        fechaInicio: inicio,
        fechaFin: fin,
        tipo,
        dias,
        comentario,
      });
      res.status(201).json(vacacion);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  obtenerTodas = async (req, res) => {
    try {
      const { estado, tipo, empId, year } = req.query;
      const filtros = {};
      if (estado) filtros.estado = estado;
      if (tipo) filtros.tipo = tipo;
      if (empId) filtros.empId = empId;
      if (year) {
        const rango = inicioYFinDeAno(anoSolicitado(year));
        filtros.fechaInicio = { $gte: rango.desde, $lt: rango.hasta };
      }

      const vacaciones = await Vacacion.find(filtros)
        .populate("empId")
        .populate("empTramitador")
        .sort({ fechaCreacion: -1 });
      res.json(vacaciones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  obtenerMias = async (req, res) => {
    try {
      const vacaciones = await Vacacion.find({ empId: req.user.id })
        .populate("empId")
        .populate("empTramitador")
        .sort({ fechaCreacion: -1 });
      res.json(vacaciones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  obtenerSaldo = async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID no valido" });
      }
      if (req.user.rol !== "admin" && req.user.id !== id) {
        return res.status(403).json({ error: "No autorizado" });
      }

      const year = anoSolicitado(req.query.year);
      res.json({ year, saldo: await saldoEmpleado(id, year) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  aprobar = async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID no valido" });
      }

      const vacacion = await Vacacion.findById(id).populate("empId");
      if (!vacacion) return res.status(404).json({ error: "Solicitud no encontrada" });
      if (vacacion.estado !== "pendiente") {
        return res.status(400).json({ error: "La solicitud ya ha sido tramitada" });
      }

      const year = vacacion.fechaInicio.getUTCFullYear();
      vacacion.dias = calcularDiasInclusivos(vacacion.fechaInicio, vacacion.fechaFin);
      const saldoAntes = await saldoEmpleado(vacacion.empId._id, year);
      const disponiblesSinEstaPendiente = saldoAntes[vacacion.tipo].disponibles + vacacion.dias;
      if (vacacion.dias > disponiblesSinEstaPendiente) {
        return res.status(400).json({ error: "El empleado ya no dispone de suficientes dias" });
      }

      vacacion.estado = "aprobado";
      vacacion.empTramitador = req.user.id;
      vacacion.fechaTramitacion = new Date();
      await vacacion.save();

      const saldo = await saldoEmpleado(vacacion.empId._id, year);
      const restantes = LIMITES_VACACIONES[vacacion.tipo] - saldo[vacacion.tipo].aprobados;
      await crearNotificacion({
        empId: vacacion.empId._id,
        tipo: "vacaciones",
        titulo: "Vacaciones aprobadas",
        mensaje: `Tu solicitud del ${vacacion.fechaInicio.toISOString().slice(0, 10)} al ${vacacion.fechaFin.toISOString().slice(0, 10)} ha sido aprobada.`,
      });
      let emailEnviado = false;
      try {
        const resultado = await sendVacationApprovedEmail({
          to: vacacion.empId.email,
          nombre: vacacion.empId.nombre,
          tipo: vacacion.tipo,
          fechaInicio: vacacion.fechaInicio,
          fechaFin: vacacion.fechaFin,
          dias: vacacion.dias,
          restantes,
          year,
        });
        emailEnviado = resultado.sent;
      } catch (mailError) {
        console.error("No se pudo enviar el correo de vacaciones:", mailError.message);
      }

      res.json({ vacacion, saldo, emailEnviado });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  rechazar = async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID no valido" });
      }
      const vacacion = await Vacacion.findById(id);
      if (!vacacion) return res.status(404).json({ error: "Solicitud no encontrada" });
      if (vacacion.estado !== "pendiente") {
        return res.status(400).json({ error: "La solicitud ya ha sido tramitada" });
      }

      vacacion.estado = "rechazado";
      vacacion.empTramitador = req.user.id;
      vacacion.fechaTramitacion = new Date();
      await vacacion.save();
      await crearNotificacion({
        empId: vacacion.empId,
        tipo: "vacaciones",
        titulo: "Vacaciones rechazadas",
        mensaje: `Tu solicitud del ${vacacion.fechaInicio.toISOString().slice(0, 10)} al ${vacacion.fechaFin.toISOString().slice(0, 10)} ha sido rechazada.`,
      });
      res.json(vacacion);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  eliminar = async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "ID no valido" });
      }
      const vacacion = await Vacacion.findByIdAndDelete(req.params.id);
      if (!vacacion) return res.status(404).json({ error: "Solicitud no encontrada" });
      res.json({ message: "Solicitud de vacaciones eliminada" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  dashboard = async (req, res) => {
    try {
      const year = anoSolicitado(req.query.year);
      const { desde, hasta } = inicioYFinDeAno(year);
      const [empleados, solicitudes] = await Promise.all([
        Empleado.countDocuments(),
        Vacacion.find({ fechaInicio: { $gte: desde, $lt: hasta } }).lean(),
      ]);

      const resumen = Object.fromEntries(
        Object.entries(LIMITES_VACACIONES).map(([tipo, total]) => [
          tipo,
          { total: total * empleados, aprobados: 0, pendientes: 0, disponibles: total * empleados },
        ]),
      );
      const estados = { pendiente: 0, aprobado: 0, rechazado: 0 };
      for (const solicitud of solicitudes) {
        solicitud.dias = calcularDiasInclusivos(solicitud.fechaInicio, solicitud.fechaFin);
        estados[solicitud.estado] += 1;
        if (solicitud.estado === "aprobado") resumen[solicitud.tipo].aprobados += solicitud.dias;
        if (solicitud.estado === "pendiente") resumen[solicitud.tipo].pendientes += solicitud.dias;
      }
      for (const tipo of Object.keys(resumen)) {
        resumen[tipo].disponibles = Math.max(
          resumen[tipo].total - resumen[tipo].aprobados - resumen[tipo].pendientes,
          0,
        );
      }

      res.json({ year, empleados, estados, saldo: resumen });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

export default new VacacionesController();

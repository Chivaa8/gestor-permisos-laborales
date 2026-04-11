import mongoose from "mongoose";
import Empleado from "../models/employee.model.js"
import Admin from "../models/tipoPermiso.model.js"

class adminModel {
  async create(admin) {
    return await admin.create(admin);
  }

  async update(id, admin) {
    return await admin.findOneAndUpdate({
      _id: new mongoose.Types.ObjectId(id),
    });
  }

  async delete(id) {
    return await Admin.findOneAndUpdate({
      _id: new mongoose.Types.ObjectId(id),
    });
  }

  async getAll() {
    return await Admin.find();
  }

  async getOne(id) {
    return await Admin.findById(id);
  }

  async contratar(empleadoId, adminId) {
    const empleado = await Empleado.findById(empleadoId);

    if (!empleado) {
      throw new Error("Empleado no encontrado");
    }

    if (empleado.contratado) {
      throw new Error("El empleado ya tiene contrato vigente");
    }

    const admin = await Admin.findById(adminId);

    if (!admin) {
      throw new Error("Administrador no encontrado");
    }

    const empleadoContratado = await Empleado.findOneAndUpdate(empleadoId, {
      contratado: true,
      contratadoPor: adminId,
    });

    return empleadoContratado;
  }

  async despedir(empleadoId, adminId) {
    const empleado = await Empleado.findById(empleadoId);

    if (!empleado) {
      throw new Error("Empleado no encontrado");
    }

    if (empleado.despedido) {
      throw new Error("El empleado ya no tenia contrato vigente");
    }

    const admin = await Admin.findById(adminId);

    if (!admin) {
      throw new Error("Administrador no encontrado");
    }

    const empleadoDespedido = await Empleado.findOneAndUpdate(empleadoId, {
      despedido: true,
      despedidoPor: adminId,
      fechaDespido: new Date(),
    });

    return empleadoDespedido;
  }

  async renovar(empleadoId, adminId) {
    const empleado = await Empleado.findById(empleadoId);

    if (!empleado) {
      throw new Error("Empleado no encontrado");
    }

    if (empleado.renovar) {
      throw new Error("El empleado ya no tenia contrato vigente");
    }

    const admin = await Admin.findById(adminId);

    if (!admin) {
      throw new Error("Administrador no encontrado");
    }

    const empleadoRenovado = await Empleado.findOneAndUpdate(empleadoId, {
      renovado: true,
      renovadoPor: adminId,
      fechaRenovacion: new Date(),
    });

    return empleadoRenovado;
  }

  async baja(empleadoId, adminId) {
    const empleado = await Empleado.findById(empleadoId);

    if (!empleado) {
      throw new Error("Empleado no encontrado");
    }

    if (empleado.darBaja) {
      throw new Error("El empleado ya no tenia contrato vigente");
    }

    const admin = await Admin.findById(adminId);

    if (!admin) {
      throw new Error("Administrador no encontrado");
    }

    const empleadoDadoBaja = await Empleado.findOneAndUpdate(empleadoId, {
      baja: true,
      dadoDeBajaPor: adminId,
      dataBaja: new Date(),
    });

    return empleadoDadoDeBaja;
  }

  async aumentarSalario(empleadoId, adminId) {
    const empleado = await Empleado.findById(empleadoId);

    if (!empleado) {
      throw new Error("Empleado no encontrado");
    }

    if (empleado.subirNomina) {
      throw new Error("El empleado ya no tiene contrato vigente");
    }

    const admin = await Admin.findById(adminId);

    if (!admin) {
      throw new Error("Administrador no encontrado");
    }

    const empleadoSubirNomina = await Empleado.findOneAndUpdate(empleadoId, {
      nominaAnterior: Number,
      nuevaNomina: Number,
      nominaSubidaPor: adminId,
    });

    return empleadoContratado;
  }
}

export default new adminModel();

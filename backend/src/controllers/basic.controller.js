import Empleado from "../models/employee.model.js";
import employeeSchema from "../schemas/employee.schema.js";

class basicController {
    constructor() {}

    async create(req, res){
        const {nombre, apellido, segundoApellido, email, username, password, foto } = req.body;
        try {
            const data = await Empleado.create({
                nombre,
                apellido,
                segundoApellido,
                email,
                username,
                password,
                foto
            });
            res.status(201).json(data);
        } catch (e) {
            res.status(500).send(e);
        }
    }

    async getOne(req, res){
        try{
            const data = await Empleado.getOne();
            res.status(200).json(data);
        } catch (e){
            res.status(500).send(e);
        }
    }
    
    async update(req, res) {
        const { nombre, apellido, segundoApellido, email, username, password, foto} = req.body;
        try {
            const { id } = req.params;
            const data = await employeeSchema.update(id, {
                nombre,
                apellido,
                segundoApellido,
                email,
                username,
                password,
                foto
            });
            res.status(200).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).send(e);
        }
    }
}
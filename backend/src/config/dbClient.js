import { MongoClient } from "mongodb";
import mongoose from "mongoose";

class dbClient {
    constructor() {
        this.conectarBaseDatos();
    }

    async conectarBaseDatos() {
        const queryString = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@${process.env.SERVER_DB}/gestorPermisosLaborables?retryWrites=true&w=majority`;

        await mongoose.connect(queryString);

        console.log("Connectado correctamente")
    }

    async cerrarConexion() {
        try{
            await mongoose.disconnect();
            console.log("Conexión a la base de datos cerrada correctamente");
        } catch (e) {
            console.error("Error al cerrar la conexión con la base de datos: ", e);
        }

    }
}

export default new dbClient();
import mongoose from "mongoose";

const EstructuraSchema = new mongoose.Schema(
    {
        dia:{type: String, required: true},
        semana: {type:String, required:true},
        categoria: {type: String, required: true},
        familia: {type: String, required: true},
        corteqlo: {type: String, required: true},//referencia al tipo de corte

    }
    
) 


export { EstructuraSchema};

import mongoose from "mongoose";

const EstructuraSchema = new mongoose.Schema(
    {
        dia:{type: String, required: true},
        semana: {type:String, required:true},
        categoria: {type: String, required: true},
        familia: {type: String},
        corteqlo: {type: String},//referencia al tipo de corte

    }
    
) 


export { EstructuraSchema};

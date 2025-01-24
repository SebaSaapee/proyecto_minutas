import * as mongoose from 'mongoose';

export const ProyeccionSchema = new mongoose.Schema({
  fecha: { type: Date, required: true },
  nombreSucursal:{type:String, required:true},
  lista: [
    { fecha: {type: String, require: true},
      Nombreplato: { type: String, required: true },
      cantidad: { type: String, required: true },
    },
  ],
});

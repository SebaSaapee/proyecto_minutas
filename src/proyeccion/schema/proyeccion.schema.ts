import * as mongoose from 'mongoose';

export const ProyeccionSchema = new mongoose.Schema({
  fecha: { type: Date, required: true },
  nombreSucursal:{type:String, required:true},
  lista: [
    { fecha: {type: String, require: true},//fecha del dia de cada plato
      platoid:{ type: mongoose.Schema.Types.ObjectId, ref: 'platos', required: true },
      Nombreplato: { type: String, required: true },
      cantidad: { type: String, required: true },
    },
  ],
});

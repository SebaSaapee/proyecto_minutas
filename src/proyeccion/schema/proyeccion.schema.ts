import * as mongoose from 'mongoose';

export const ProyeccionSchema = new mongoose.Schema({
  fecha: { type: Date, required: true },
  lista: [
    {
      Nombreplato: { type: String, required: true },
      cantidad: { type: String, required: true },
    },
  ],
});

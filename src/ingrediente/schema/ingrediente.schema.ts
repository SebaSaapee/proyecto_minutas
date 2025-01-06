import * as mongoose from 'mongoose';

export const IngredienteSchema = new mongoose.Schema(
  {
    nombreIngrediente: { type: String, required: true },
    unidadmedida: { type: String, required: true },
  },
  { timestamps: true },
);
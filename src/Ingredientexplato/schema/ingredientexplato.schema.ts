import * as mongoose from 'mongoose';

export const IngredientexplatoSchema = new mongoose.Schema({
  id_plato: { type: mongoose.Schema.Types.ObjectId, ref: 'platos', required: true },
  id_ingrediente: { type: mongoose.Schema.Types.ObjectId, ref: 'ingredientes', required: true },
  porcion_neta: { type: Number, required: true },
  peso_bruto: { type: Number, required: true },
  rendimiento: { type: Number, required: true },
});
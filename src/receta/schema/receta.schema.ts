import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const RecetaSchema = new mongoose.Schema(
  {
    nombreReceta: { type: String, required: true },
    id_plato: { type: Schema.Types.ObjectId, ref: 'platos', required: true }, // Referencia al modelo Plato
    preparacion: { type: String, required: true },
  },
  { timestamps: true }, // Agrega createdAt y updatedAt automáticamente
);
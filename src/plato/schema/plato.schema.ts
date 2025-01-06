import * as mongoose from 'mongoose';

export const PlatoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  categoria: { type: String, required: true }, 
  descontinuado: { type: Boolean, default: false },
  
});


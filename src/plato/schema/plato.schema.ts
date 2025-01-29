import * as mongoose from 'mongoose';

export const PlatoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoria: { type: String, required: true }, 
  descontinuado: { type: Boolean, default: false, required:true },
  familia: { type: String, required: true },
  tipo_corte: { type: String },
  temporada: {type: String}
  
});


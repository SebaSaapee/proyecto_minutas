
import * as mongoose from 'mongoose';

export const MenuDiarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    fecha: { type: Date, required: true, unique: false }, // La fecha ya no es única aquí
    semana: { type: Number, required: true }, // Campo para número de semana
    id_sucursal: { type: mongoose.Schema.Types.ObjectId, ref: 'sucursales', required: true },
    estado: { type: String, required: true },
    listaplatos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'platos' }],
  },
  { timestamps: true },
);

// Índice compuesto para garantizar que la combinación de fecha, semana e id_sucursal sea única
MenuDiarioSchema.index({ fecha: 1, semana: 1, id_sucursal: 1 }, { unique: true });
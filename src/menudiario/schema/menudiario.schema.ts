import * as mongoose from 'mongoose';

export const MenuDiarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    fecha: { type: Date, required: true },
    id_sucursal: { type: String, required: true },
    estado: { type: String, required: true },
    listaplatos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'platos' }],
  },
  { timestamps: true },
);
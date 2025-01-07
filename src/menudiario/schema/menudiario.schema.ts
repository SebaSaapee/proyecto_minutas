import * as mongoose from 'mongoose';

export const MenuDiarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    fecha_inicio: { type: Date, required: true },  // Campo para fecha de inicio
    fecha_termino: { type: Date, required: true }, // Campo para fecha de término
    semana: { type: Number, required: true }, // Campo para número de semana
    id_sucursal: { type: mongoose.Schema.Types.ObjectId, ref: 'Sucursal', required: true },
    estado: { type: String, required: true },
    listaplatos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'platos' }],
  },
  { timestamps: true },
);
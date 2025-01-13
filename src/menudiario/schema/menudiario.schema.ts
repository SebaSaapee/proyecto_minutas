import * as mongoose from 'mongoose';

export const MenuDiarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    fecha :{type: Date, required: true},
    semana: { type: Number, required: true }, // Campo para número de semana
    id_sucursal: { type: mongoose.Schema.Types.ObjectId, ref: 'sucursales', required: true },

    estado: { type: String, required: true },
    listaplatos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'platos' }],
  },
  { timestamps: true },
);
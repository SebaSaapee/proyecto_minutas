import * as mongoose from 'mongoose';

const MenuDiarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    fecha: { type: Date, required: true }, // Fecha simple, sin restricción de unicidad directa aquí
    semana: { type: Number, required: true }, // Campo para número de semana
    id_sucursal: { type: mongoose.Schema.Types.ObjectId, ref: 'sucursales', required: true },
    estado: { type: String, required: true },
    listaplatos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'platos' }],
  },
  { timestamps: true },
);

// Índice para garantizar que la fecha sea única
MenuDiarioSchema.index({ fecha: 1 }, { unique: true });

// Índice compuesto para evitar duplicados en fecha, semana e id_sucursal
MenuDiarioSchema.index({ fecha: 1, semana: 1, id_sucursal: 1 }, { unique: true });

export { MenuDiarioSchema };
import * as mongoose from 'mongoose';

const MenuDiarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    fecha: { type: Date, required: true, unique: false }, 
    semana: { type: Number, required: true },
    year: { type: Number, required: true },
    id_sucursal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'sucursales', // Referencia al modelo de Sucursal
      required: true,
    },
    listaplatos: [{ 
      platoId: { type: mongoose.Schema.Types.ObjectId, ref: 'platos', required: true },
      fila: { type: String, required: true }
    }],
    aprobado: { type: Boolean, required: false },
    mensaje: { type: String, default: 'sin mensaje' } 
  },
  { timestamps: true },
);

// Índice compuesto para evitar duplicados en fecha, semana e id_sucursal
MenuDiarioSchema.index({ fecha: 1, semana: 1, id_sucursal: 1 }, { unique: true });

export { MenuDiarioSchema };
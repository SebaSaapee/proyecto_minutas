import * as mongoose from 'mongoose';

export const SucursalSchema = new mongoose.Schema(
  {
    nombresucursal: { type: String, required: true },
    direccion: { type: String, required: true },
  },
  { timestamps: true },
);
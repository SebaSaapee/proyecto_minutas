import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ["user", "admin", "logistica","gerencia"], // Valores permitidos para "role"
      default: "user" // Valor por defecto
    }
  },
  { timestamps: true },
);

UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
import { Document } from 'mongoose';
import { IPlato } from './plato.interface';

export interface IReceta extends Document {
  readonly nombreReceta: string;
  readonly id_plato: IPlato | string; // Puede ser un objeto completo o solo el ID
  readonly preparacion: string;
  readonly createdAt?: Date; // Incluido por `timestamps`
  readonly updatedAt?: Date; // Incluido por `timestamps`
}
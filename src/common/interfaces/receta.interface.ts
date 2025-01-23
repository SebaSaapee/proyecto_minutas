import { Document } from 'mongoose';
import { IPlato } from './plato.interface';

export interface IReceta extends Document {
  readonly nombreReceta: string;
  readonly id_plato: IPlato | string; 
  readonly preparacion: string;
  readonly createdAt?: Date; 
  readonly updatedAt?: Date; 
}
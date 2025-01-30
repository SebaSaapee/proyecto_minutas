import {  IPlato } from 'src/common/interfaces/plato.interface';
import { ISucursal } from './sucursal.interface';

export interface IMenudiario extends Document {
  _id?: string;
  nombre: string;
  fecha: Date;
  id_sucursal: ISucursal;
  estado: string;
  listaplatos: IPlato[];
  mensaje: String;
  createdAt?: Date;
  updatedAt?: Date;
  
}

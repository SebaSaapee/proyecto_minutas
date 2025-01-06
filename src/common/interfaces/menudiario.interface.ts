import {  IPlato } from 'src/common/interfaces/plato.interface';

export interface IMenudiario extends Document {
  _id?: string;
  nombre: string;
  fecha: Date;
  id_sucursal: string;
  estado: string;
  listaplatos: IPlato[];
  
}

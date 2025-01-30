import { Document } from 'mongoose';

export interface IProyeccion extends Document {
  fecha: Date;
  nombreSucursal: string;
  lista: {
    fecha: string;
    platoid: string
    Nombreplato: string;
    cantidad: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

import { Document } from 'mongoose';

export interface IProyeccion extends Document {
  fecha: Date;
  lista: {
    fecha: string;
    Nombreplato: string;
    cantidad: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

import { Document } from 'mongoose';

export interface IProyeccion extends Document {
  fecha: Date;
  lista: {
    Nombreplato: string;
    cantidad: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

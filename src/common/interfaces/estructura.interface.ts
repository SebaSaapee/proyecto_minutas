export interface IEstructura extends Document {
  _id?: string;
  dia: string;
  semana: string;
  categoria: string;
  familia: string;
  corteqlo: string;
  createdAt?: Date;
  updatedAt?: Date;
}
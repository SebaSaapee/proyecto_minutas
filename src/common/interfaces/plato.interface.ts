export interface IPlato extends Document {
  nombre: string;
  descripcion: string;
  categoria: string;
  createdAt?: Date;
  updatedAt?: Date;
}

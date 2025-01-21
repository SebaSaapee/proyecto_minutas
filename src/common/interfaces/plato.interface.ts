export interface IPlato extends Document {
  platoId?;
  nombre: string;
  descripcion: string;
  categoria: string;
  createdAt?: Date;
  updatedAt?: Date;
}

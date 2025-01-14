export interface IPlato extends Document {
  _id?:string;
  nombre: string;
  descripcion: string;
  categoria: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPlato extends Document {
  platoId?;
  nombre: string;
  categoria: string;
  descontinuado: boolean;
  familia: string;
  corteqlo: string;
  temporada: string;
  createdAt?: Date;
  updatedAt?: Date;

  
}

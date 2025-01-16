export interface IIngrediente extends Document {
    _id?: string;
    nombreIngrediente: string;
    unidadmedida : string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
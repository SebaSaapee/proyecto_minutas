import { IIngrediente } from "./ingrediente.interface";
import { IPlato } from "./plato.interface";

export interface IIngredientexplato {
    id_plato: IPlato;
    id_ingrediente: IIngrediente;
    porcion_neta: number;
    peso_bruto: number;
    rendimiento: number;
  }
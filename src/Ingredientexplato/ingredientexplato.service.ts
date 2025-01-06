import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IIngredientexplato } from 'src/common/interfaces/ingredientexplato.interface';
import { INGREDIENTEXPLATO } from 'src/common/models/models';
import { IngredientexplatoDTO } from './dto/ingredientexplato.dto';

@Injectable()
export class IngredientexplatoService {
  constructor(
    @InjectModel(INGREDIENTEXPLATO.name) private readonly model: Model<IIngredientexplato>,
  ) {}

  // Crear un nuevo ingredientexplato
  async create(ingredientexplatoDTO: IngredientexplatoDTO): Promise<IIngredientexplato> {
    const newIngredientexplato = new this.model(ingredientexplatoDTO);
    return await newIngredientexplato.save();
  }

  // Obtener todos los ingredientexplatos
  async findAll(): Promise<IIngredientexplato[]> {
    return await this.model.find();
  }

  // Obtener un ingredientexplato por su ID
  async findOne(id: string): Promise<IIngredientexplato> {
    return await this.model.findById(id);
  }

  // Actualizar un ingredientexplato por su ID
  async update(id: string, ingredientexplatoDTO: IngredientexplatoDTO): Promise<IIngredientexplato> {
    return await this.model.findByIdAndUpdate(id, ingredientexplatoDTO, { new: true });
  }

  // Eliminar un ingredientexplato por su ID
  async delete(id: string) {
    await this.model.findByIdAndDelete(id);
    return {
      status: HttpStatus.OK,
      msg: 'Deleted',
    };
  }
}
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IngredienteDTO } from './dto/ingrediente.dto';

import { INGREDIENTE } from '../common/models/models';
import { IIngrediente } from 'src/common/interfaces/ingrediente.interface';

@Injectable()
export class IngredienteService {
  constructor(
    @InjectModel(INGREDIENTE.name)
    private readonly model: Model<IIngrediente>,
  ) {}

  async create(ingredienteDTO: IngredienteDTO): Promise<IIngrediente> {
    const newIngrediente = new this.model(ingredienteDTO);
    return await newIngrediente.save();
  }

  async findAll(): Promise<IIngrediente[]> {
    return await this.model.find();
  }

  async findOne(id: string): Promise<IIngrediente> {
    return await this.model.findById(id);
  }

  async update(id: string, ingredienteDTO: IngredienteDTO): Promise<IIngrediente> {
    return await this.model.findByIdAndUpdate(id, ingredienteDTO, { new: true });
  }

  async delete(id: string) {
    await this.model.findByIdAndDelete(id);
    return {
      status: HttpStatus.OK,
      msg: 'Ingrediente eliminado correctamente',
    };
  }

 // Nueva función para encontrar solo 1 ingrediente por nombre
 async findByName(nombre: string): Promise<IIngrediente | null> {
  return await this.model.findOne({ nombreIngrediente: new RegExp(nombre, 'i') });
}

}
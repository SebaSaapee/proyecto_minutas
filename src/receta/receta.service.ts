import { Injectable, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecetaDTO } from './dto/receta.dto';

import { RECETA } from 'src/common/models/models';
import { IReceta } from 'src/common/interfaces/receta.interface';

@Injectable()
export class RecetaService {
  constructor(
    @InjectModel(RECETA.name)
    private readonly model: Model<IReceta>,
  ) {}

  async create(recetaDTO: RecetaDTO): Promise<IReceta> {
    const newReceta = new this.model(recetaDTO);
    return await newReceta.save();
  }

  async findAll(): Promise<IReceta[]> {
    return await this.model.find().populate('id_plato'); // Poblamos la referencia a Plato
  }

  async findOne(id: string): Promise<IReceta> {
    const receta = await this.model.findById(id).populate('id_plato'); // Poblamos la referencia a Plato
    if (!receta) {
      throw new NotFoundException(`Receta with ID ${id} not found`);
    }
    return receta;
  }

  async update(id: string, recetaDTO: RecetaDTO): Promise<IReceta> {
    const updatedReceta = await this.model.findByIdAndUpdate(id, recetaDTO, { new: true }).populate('id_plato');
    if (!updatedReceta) {
      throw new NotFoundException(`Receta with ID ${id} not found`);
    }
    return updatedReceta;
  }

  async delete(id: string) {
    const deletedReceta = await this.model.findByIdAndDelete(id);
    if (!deletedReceta) {
      throw new NotFoundException(`Receta with ID ${id} not found`);
    }
    return {
      status: HttpStatus.OK,
      msg: 'Receta deleted successfully',
    };
  }
}
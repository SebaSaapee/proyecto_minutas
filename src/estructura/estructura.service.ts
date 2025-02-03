import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EstructuraDTO } from './dto/estructura.dto';
import { IEstructura } from 'src/common/interfaces/estructura.interface';
import { ESTRUCTURA } from 'src/common/models/models';

@Injectable()
export class EstructuraService {
  constructor(
    @InjectModel(ESTRUCTURA.name) private readonly model: Model<IEstructura>,
  ) {}

  // Crear un registro
  async create(createEstructuraDto: EstructuraDTO): Promise<IEstructura> {
    const newEstructura = new this.model(createEstructuraDto);
    return newEstructura.save();
  }

  // Obtener todos los registros
  async findAll(): Promise<IEstructura[]> {
    return this.model.find().exec();
  }

  // Obtener un registro por ID
  async findOne(id: string): Promise<IEstructura> {
    const estructura = await this.model.findById(id).exec();
    if (!estructura) {
      throw new NotFoundException(`Estructura with ID "${id}" not found`);
    }
    return estructura;
  }

  // Actualizar un registro por ID
  async update( id: string, estructuraDTO: EstructuraDTO ): Promise<IEstructura> {
    const updatedEstructura = await this.model
      .findByIdAndUpdate(id, estructuraDTO, { new: true })
      .exec();
    if (!updatedEstructura) {
      throw new NotFoundException(`Estructura with ID "${id}" not found`);
    }
    return updatedEstructura;
  }

  // Actualizar múltiples registros por semana
  async updateBySemana(semana: string, estructurasDTO: EstructuraDTO[]): Promise<void> {
    // Primero, eliminamos todos los registros existentes para esa semana
    await this.model.deleteMany({ semana }).exec();

    // Luego, creamos nuevos registros con los datos proporcionados
    const newEstructuras = estructurasDTO.map(estructura => ({
      ...estructura,
      semana,
    }));

    await this.model.insertMany(newEstructuras);
  }

  // Eliminar un registro por ID
  async delete(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Estructura with ID "${id}" not found`);
    }
  }
}
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PROYECCION } from 'src/common/models/models';
import { ProyeccionDTO } from './dto/proyeccion.dto';
import { IProyeccion } from 'src/common/interfaces/proyeccion.interface';

@Injectable()
export class ProyeccionService {
  constructor(
    @InjectModel(PROYECCION.name) private readonly model: Model<IProyeccion>,
  ) {}

  async create(proyeccionDTO: ProyeccionDTO): Promise<IProyeccion> {
    const newProyeccion = new this.model(proyeccionDTO);
    return await newProyeccion.save();
  }

  async findAll(): Promise<IProyeccion[]> {
    return await this.model.find();
  }

  async findOne(id: string): Promise<IProyeccion> {
    return await this.model.findById(id);
  }

  async update(id: string, proyeccionDTO: ProyeccionDTO): Promise<IProyeccion> {
    return await this.model.findByIdAndUpdate(id, proyeccionDTO, { new: true });
  }

  async delete(id: string) {
    await this.model.findByIdAndDelete(id);
    return {
      status: HttpStatus.OK,
      msg: 'Deleted',
    };
  }
}
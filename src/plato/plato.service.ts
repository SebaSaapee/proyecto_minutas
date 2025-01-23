import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {  IPlato } from 'src/common/interfaces/plato.interface';
import {  PLATO } from 'src/common/models/models';
import {  PlatoDTO } from './dto/plato.dto';

@Injectable()
export class PlatoService {
  constructor(
    @InjectModel(PLATO.name) private readonly model: Model<IPlato>,
  ) {}

  async create(platoDTO: PlatoDTO): Promise<IPlato> {
    const newPlato = new this.model(platoDTO);
    return await newPlato.save();
  }

  async findAll(): Promise<IPlato[]> {
    return await this.model.find();
  }

  async findOne(id: string): Promise<IPlato> {
    return await this.model.findById(id);
  }

  async update(id: string, platoDto: PlatoDTO): Promise<IPlato> {
    return await this.model.findByIdAndUpdate(id, platoDto, { new: true });
  }

  async delete(id: string) {
    await this.model.findByIdAndDelete(id);
    return {
      status: HttpStatus.OK,
      msg: 'Deleted',
    };
  }
}

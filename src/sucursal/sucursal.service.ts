import { Injectable, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SucursalDTO } from './dto/sucursal.dto';
import { ISucursal } from '../common/interfaces/sucursal.interface';
import { SUCURSAL } from '../common/models/models';

@Injectable()
export class SucursalService {
  constructor(
    @InjectModel(SUCURSAL.name)
    private readonly model: Model<ISucursal>,
  ) {}

  async create(sucursalDTO: SucursalDTO): Promise<ISucursal> {
    const newSucursal = new this.model(sucursalDTO);
    return await newSucursal.save();
  }

  async findAll(): Promise<ISucursal[]> {
    return await this.model.find();
  }

  async findOne(id: string): Promise<ISucursal> {
    const sucursal = await this.model.findById(id);
    if (!sucursal) {
      throw new NotFoundException(`Sucursal with ID ${id} not found`);
    }
    return sucursal;
  }

  async update(id: string, sucursalDTO: SucursalDTO): Promise<ISucursal> {
    const updatedSucursal = await this.model.findByIdAndUpdate(id, sucursalDTO, { new: true });
    if (!updatedSucursal) {
      throw new NotFoundException(`Sucursal with ID ${id} not found`);
    }
    return updatedSucursal;
  }

  async delete(id: string) {
    const deletedSucursal = await this.model.findByIdAndDelete(id);
    if (!deletedSucursal) {
      throw new NotFoundException(`Sucursal with ID ${id} not found`);
    }
    return {
      status: HttpStatus.OK,
      msg: 'Sucursal deleted successfully',
    };
  }
}
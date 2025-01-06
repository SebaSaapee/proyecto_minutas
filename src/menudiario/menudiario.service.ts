import {  MenuDTO } from './dto/menudiario.dto';
import {  MENUDIARIO } from '../common/models/models';
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMenudiario } from 'src/common/interfaces/menudiario.interface';


@Injectable()
export class MenuDiarioService {
  constructor(
    @InjectModel(MENUDIARIO.name)
    private readonly model: Model<IMenudiario>,
  ) {}

 
  async create(menuDTO: MenuDTO): Promise<IMenudiario> {
    const newMenu = new this.model(menuDTO);
    return await newMenu.save();
  }

  async findAll(): Promise<IMenudiario[]> {
    return await this.model.find().populate('passengers');
  }

 // async findOne(id: string): Promise<IMenudiario> {
    //hacerdenuevo con chat gpt
  //}

  async update(id: string, menuDTO: MenuDTO): Promise<IMenudiario> {
    return await this.model.findByIdAndUpdate(id, menuDTO, { new: true });
  }

  async delete(id: string) {
    await this.model.findByIdAndDelete(id);
    return {
      status: HttpStatus.OK,
      msg: 'Deleted',
    };
  }

  async addPassenger(id_menu: string, plato_Id: string): Promise<IMenudiario> {
    return await this.model
      .findByIdAndUpdate(
        id_menu,
        {
          $addToSet: { listaplatos: plato_Id },
        },
        { new: true },
      )
      .populate('passengers');
  }
}

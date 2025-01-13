import { MenuDTO } from './dto/menudiario.dto';
import { MENUDIARIO } from '../common/models/models';
import { Injectable, HttpStatus, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMenudiario } from 'src/common/interfaces/menudiario.interface';

@Injectable()
export class MenuDiarioService {
  constructor(
    @InjectModel(MENUDIARIO.name)
    private readonly model: Model<IMenudiario>,
  ) {}

  // Crear menú asegurándose de que no se repita en 12 semanas
  async create(menuDTO: MenuDTO): Promise<IMenudiario> {
    const last12Weeks = new Date();
    last12Weeks.setDate(last12Weeks.getDate() - 84); // 12 semanas atrás

    const existingMenu = await this.model.findOne({
      createdAt: { $gte: last12Weeks }, // Menús creados en las últimas 12 semanas
      listaplatos: { $all: menuDTO.listaplatos }, // Verifica si ya existe un menú con los mismos platos
    });

    if (existingMenu) {
      throw new BadRequestException(
        'Un menú con esta combinación de platos ya existe en las últimas 12 semanas.',
      );
    }

    const newMenu = new this.model(menuDTO);
    return await newMenu.save();
  }

  async findAll(): Promise<IMenudiario[]> {
    return await this.model.find().populate('listaplatos').populate('id_sucursal');
  }

  async findOne(id: string): Promise<IMenudiario> {
    const menu = await this.model.findById(id).populate('listaplatos');
    if (!menu) {
      throw new BadRequestException(`Menú con ID ${id} no encontrado.`);
    }
    return menu;
  }

  async update(id: string, menuDTO: MenuDTO): Promise<IMenudiario> {
    const updatedMenu = await this.model.findByIdAndUpdate(id, menuDTO, {
      new: true,
    });
    if (!updatedMenu) {
      throw new BadRequestException(`Menú con ID ${id} no encontrado.`);
    }
    return updatedMenu;
  }

  async delete(id: string) {
    const deletedMenu = await this.model.findByIdAndDelete(id);
    if (!deletedMenu) {
      throw new BadRequestException(`Menú con ID ${id} no encontrado.`);
    }
    return {
      status: HttpStatus.OK,
      msg: 'Menú eliminado exitosamente.',
    };
  }

  // Agregar un plato al menú
  async addPlato(id_menu: string, plato_Id: string): Promise<IMenudiario> {
    return await this.model
      .findByIdAndUpdate(
        id_menu,
        {
          $addToSet: { listaplatos: plato_Id },
        },
        { new: true },
      )
      .populate('listaplatos');
  }
}
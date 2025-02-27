import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { INGREDIENTEXPLATO, PROYECCION } from 'src/common/models/models';
import { ProyeccionDTO } from './dto/proyeccion.dto';
import { IProyeccion } from 'src/common/interfaces/proyeccion.interface';
import { IIngredientexplato } from 'src/common/interfaces/ingredientexplato.interface';
import { IIngrediente } from 'src/common/interfaces/ingrediente.interface';
import dayjs from 'dayjs';

@Injectable()
export class ProyeccionService {
  constructor(
    @InjectModel(PROYECCION.name) private readonly model: Model<IProyeccion>,
    @InjectModel( INGREDIENTEXPLATO.name) private readonly ingredientexplatoModel: Model<IIngredientexplato>,
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
  
  async generateIngredientReportForProjection(proyeccionId: string, fecha?: string): Promise<any> {
    // Fetch the specific projection
    const projection = await this.model.findById(proyeccionId).populate('lista.platoid');
    if (!projection) {
        throw new Error('Proyección no encontrada');
    }

    let filteredList = projection.lista;

    // Si se proporciona una fecha, filtrar la lista de platos
    if (fecha) {
        const dateToCompare = new Date(fecha.split('-').reverse().join('-'));
        filteredList = projection.lista.filter(item => {
            const itemDate = new Date(item.fecha.split('-').reverse().join('-'));
            return itemDate.toDateString() === dateToCompare.toDateString();
        });
    }

    const ingredientMap = new Map<string, { nombre: string; cantidad: number; unidadmedida: string }>();

    // Ordenar la lista por fecha (de menor a mayor)
    const sortedList = filteredList.sort((a, b) => {
        const dateA = new Date(a.fecha.split('-').reverse().join('-')); // Convertir "DD-MM-YYYY" a "YYYY-MM-DD"
        const dateB = new Date(b.fecha.split('-').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
    });

    // Obtener la primera y última fecha
    const startDate = new Date(sortedList[0].fecha.split('-').reverse().join('-'));
    const endDate = new Date(sortedList[sortedList.length - 1].fecha.split('-').reverse().join('-'));

    for (const item of sortedList) {
        const { platoid, cantidad } = item;
        // Fetch ingredients for the current dish
        const ingredients = await this.ingredientexplatoModel
            .find({ id_plato: platoid })
            .populate('id_ingrediente');

        for (const ingredientEntry of ingredients) {
            const { id_ingrediente, peso_bruto } = ingredientEntry;
            const ingrediente = id_ingrediente as IIngrediente;
            if (!ingrediente || !peso_bruto) continue;
            const totalCantidad = parseInt(cantidad) * peso_bruto;
            if (ingredientMap.has(ingrediente.nombreIngrediente)) {
                ingredientMap.get(ingrediente.nombreIngrediente).cantidad += totalCantidad;
            } else {
                ingredientMap.set(ingrediente.nombreIngrediente, {
                    nombre: ingrediente.nombreIngrediente,
                    cantidad: totalCantidad,
                    unidadmedida: ingrediente.unidadmedida,
                });
            }
        }
    }

    // Build the report
    const report = Array.from(ingredientMap.values()).map((ingredient) => ({
        nombreIngrediente: ingredient.nombre,
        cantidadTotal: ingredient.cantidad,
        unidadMedida: ingredient.unidadmedida,
    }));

    console.log(startDate, endDate, report);
    return {
        fechaInicio: startDate,
        fechaFin: endDate,
        ingredientes: report,
    };
  }
}


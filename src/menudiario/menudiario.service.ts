import { MenuDTO } from './dto/menudiario.dto';
import { INGREDIENTEXPLATO, MENUDIARIO, PLATO } from '../common/models/models';
import { Injectable, HttpStatus, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMenudiario } from 'src/common/interfaces/menudiario.interface';
import { IIngredientexplato } from 'src/common/interfaces/ingredientexplato.interface';
import { IPlato } from 'src/common/interfaces/plato.interface';

@Injectable()
export class MenuDiarioService {
  constructor(
    @InjectModel(MENUDIARIO.name)
    private readonly model: Model<IMenudiario>,
     @InjectModel( INGREDIENTEXPLATO.name) private readonly ingredientexplatoModel: Model<IIngredientexplato>,
     @InjectModel(PLATO.name) // Inyectamos el modelo de Plato para hacer consultas sobre ellos
     private readonly platoModel: Model<IPlato>,  
  ) {}

  // Crear menú asegurándose de que no se repita en 12 semanas
  async create(menuDTO: MenuDTO): Promise<IMenudiario> {
    const last12Weeks = new Date();
    last12Weeks.setDate(last12Weeks.getDate() - 84); // 12 semanas atrás
  
    const last4Weeks = new Date();
    last4Weeks.setDate(last4Weeks.getDate() - 28); // 4 semanas atrás
  
    // Validar si ya existe un menú con la misma fecha
    const existingMenu = await this.model.findOne({ fecha: menuDTO.fecha });
    if (existingMenu) {
      throw new BadRequestException('Ya existe un menú registrado con esta fecha.');
    }
  
    // Obtener todos los platos por su ID
    const platos = await this.platoModel.find({ 
      '_id': { $in: menuDTO.listaplatos } // Filtramos los platos por los IDs de la lista
    });
  
    // Filtramos los platos según su categoría
    const platosFondoIds = platos.filter(plato => plato.categoria === 'PLATO DE FONDO').map(plato => plato._id);
    const platosRestrictivosIds = platos.filter(plato =>
      ['VEGETARIANO', 'VEGANA', 'GUARNICIÓN'].includes(plato.categoria)
    ).map(plato => plato._id);
  
    const otrosPlatosIds = platos.filter(plato =>
      !['PLATO DE FONDO', 'VEGETARIANO', 'VEGANA', 'GUARNICIÓN'].includes(plato.categoria)
    ).map(plato => plato._id);
  
    // Verificar que no se repitan platos de fondo en las últimas 12 semanas
    const existingPlatoFondo = await this.model.findOne({
      createdAt: { $gte: last12Weeks },
      listaplatos: { $in: platosFondoIds }, // Comprobamos si hay algún plato de fondo repetido
    });
  
    if (existingPlatoFondo) {
      throw new BadRequestException(
        'Un menú con los mismos platos de fondo ya existe en las últimas 12 semanas.',
      );
    }
  
    // Verificar que no se repitan platos restrictivos (vegetariano, vegano, guarnición) en las últimas 4 semanas
    const existingPlatoRestrictivo = await this.model.findOne({
      createdAt: { $gte: last4Weeks },
      listaplatos: { $in: platosRestrictivosIds }, // Comprobamos si hay algún plato restrictivo repetido
    });
  
    if (existingPlatoRestrictivo) {
      throw new BadRequestException(
        'Un menú con los mismos platos vegetarianos, veganos o de guarnición ya existe en las últimas 4 semanas.',
      );
    }
  
    // Verificar que no haya platos repetidos en todo el menú (todos los platos por su ID)
    const allPlatosIds = [...platosFondoIds, ...platosRestrictivosIds, ...otrosPlatosIds];
    const platosUnicos = new Set(allPlatosIds.map(platoId => platoId.toString())); // Usamos Set para eliminar duplicados
    if (platosUnicos.size !== allPlatosIds.length) {
      throw new BadRequestException('Hay platos repetidos en el menú.');
    }
  
    // Si no se encontraron duplicados, creamos el nuevo menú
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



  //Funcion para calcular ingredientes x periodo de tiempo y sucursal.
  async calcularIngredientesPorPeriodo(
    filtro: { fechaInicio: Date; fechaFin: Date; sucursalId: string; platosConCantidad: { platoId: string; cantidad: number }[] },
  ): Promise<{
    ingredientesTotales: { [ingredienteId: string]: { nombreIngrediente: string; cantidad: number; unidadmedida: string } };
    ingredientesPorPlato: { [platoId: string]: { [ingredienteId: string]: { nombreIngrediente: string; cantidad: number; unidadmedida: string } } };
  }> {
    const ingredientesTotales: { [ingredienteId: string]: { nombreIngrediente: string; cantidad: number; unidadmedida: string } } = {};
    const ingredientesPorPlato: { [platoId: string]: { [ingredienteId: string]: { nombreIngrediente: string; cantidad: number; unidadmedida: string } } } = {};
  
    // Obtener menús del período filtrado por sucursal
    const menus = await this.model
      .find({
        fecha: { $gte: filtro.fechaInicio, $lte: filtro.fechaFin },
        id_sucursal: filtro.sucursalId,
      })
      .populate('listaplatos')
      .exec();
  
    // Procesar cada menú
    for (const menu of menus) {
      for (const plato of menu.listaplatos) {
        // Obtener la cantidad del plato en la lista de platos con cantidad
        const platoConCantidad = filtro.platosConCantidad.find(p => p.platoId === plato._id.toString());
        const cantidadPlato = platoConCantidad ? platoConCantidad.cantidad : 0;
  
        // Inicializa la entrada del plato si no existe
        if (!ingredientesPorPlato[plato._id]) {
          ingredientesPorPlato[plato._id] = {};
        }
  
        // Obtener ingredientes del plato
        const ingredientesDelPlato = await this.ingredientexplatoModel
          .find({ id_plato: plato._id })
          .populate('id_ingrediente')
          .exec();
  
        // Calcular ingredientes necesarios por plato, multiplicados por la cantidad de platos
        for (const ingredienteDelPlato of ingredientesDelPlato) {
          const { id_ingrediente, porcion_neta } = ingredienteDelPlato;
          const ingrediente = id_ingrediente as any;
  
          if (porcion_neta) {
            const cantidadTotalIngrediente = porcion_neta * cantidadPlato;
  
            // Sumar al total general de ingredientes
            if (ingredientesTotales[ingrediente._id]) {
              ingredientesTotales[ingrediente._id].cantidad += cantidadTotalIngrediente;
            } else {
              ingredientesTotales[ingrediente._id] = {
                nombreIngrediente: ingrediente.nombreIngrediente,
                cantidad: cantidadTotalIngrediente,
                unidadmedida: ingrediente.unidadmedida,
              };
            }
  
            // Sumar al desglose por plato
            if (ingredientesPorPlato[plato._id][ingrediente._id]) {
              ingredientesPorPlato[plato._id][ingrediente._id].cantidad += cantidadTotalIngrediente;
            } else {
              ingredientesPorPlato[plato._id][ingrediente._id] = {
                nombreIngrediente: ingrediente.nombreIngrediente,
                cantidad: cantidadTotalIngrediente,
                unidadmedida: ingrediente.unidadmedida,
              };
            }
          }
        }
      }
    }
  
    return {
      ingredientesTotales,
      ingredientesPorPlato,
    };
  }
  
  async getPlatosEntreFechas(fechaInicio: Date, fechaFin: Date): Promise<IPlato[]> {
    // Verificar que las fechas son válidas
    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      throw new BadRequestException('Las fechas proporcionadas no son válidas.');
    }

    if (fechaInicio > fechaFin) {
      throw new BadRequestException('La fecha de inicio no puede ser posterior a la fecha de fin.');
    }

    // Obtener los menús que se encuentran en el rango de fechas
    const menus = await this.model
      .find({
        fecha: { $gte: fechaInicio, $lte: fechaFin },
      })
      .populate('listaplatos') // Poblar los platos de cada menú
      .exec();

    // Crear un set para evitar platos duplicados
    const platosSet = new Set<IPlato>();

    // Recorrer los menús y agregar los platos al set
    menus.forEach(menu => {
      menu.listaplatos.forEach(plato => {
        platosSet.add(plato); // Añadimos los platos únicos
      });
    });

    // Convertir el set en un array y devolverlo
    return Array.from(platosSet);
  }
  
}
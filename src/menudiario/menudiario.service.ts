import { MenuDTO } from './dto/menudiario.dto';
import { INGREDIENTEXPLATO, MENUDIARIO, PLATO } from '../common/models/models';
import { Injectable, HttpStatus, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMenudiario } from 'src/common/interfaces/menudiario.interface';
import { IIngredientexplato } from 'src/common/interfaces/ingredientexplato.interface';
import { IPlato } from 'src/common/interfaces/plato.interface';
import { IIngrediente } from 'src/common/interfaces/ingrediente.interface';

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

    // Filtramos los platos de ensalada
    const platosEnsalada = platos.filter(plato => plato.categoria === 'ENSALADA');
    
    // Validar que el conjunto de ensaladas no tenga más de 3 platos
    if (platosEnsalada.length !== 3) {
        throw new BadRequestException('El menú debe contener exactamente 3 ensaladas.');
    }

    // Obtenemos los IDs de las ensaladas
    const platosEnsaladaIds = platosEnsalada.map(plato => plato._id);

    // Verificar que no se repita el conjunto de ensaladas en las últimas 4 semanas
    const existingPlatoEnsalada = await this.model.findOne({
        createdAt: { $gte: last4Weeks },
        listaplatos: { $all: platosEnsaladaIds }, // Comprobamos si ya existe el conjunto de ensaladas
    });

    if (existingPlatoEnsalada) {
        throw new BadRequestException(
            'Un menú con el mismo conjunto de ensaladas ya existe en las últimas 4 semanas.',
        );
    }

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
  
 // Método para obtener los menús no aprobados
 async getMenusNoAprobados(): Promise<IMenudiario[]> {
  return this.model.find({ aprobado: false }).exec();
}

async aprobarMenu(id: string, aprobado: boolean) {
  return this.model.findByIdAndUpdate(id, { aprobado }, { new: true }).exec();
}


async getPlatosDisponiblesPorFecha(fecha: Date): Promise<IPlato[]> {
    const fechaInicio = new Date(fecha); // Clonamos la fecha para no modificar la original

    // Obtenemos la fecha de inicio para el rango de 12 semanas (platos de fondo)
    const fechaInicio12Semanas = new Date(fechaInicio);
    fechaInicio12Semanas.setDate(fechaInicio12Semanas.getDate() - 84);

    // Obtenemos la fecha de inicio para el rango de 4 semanas (platos restrictivos y ensaladas)
    const fechaInicio4Semanas = new Date(fechaInicio);
    fechaInicio4Semanas.setDate(fechaInicio4Semanas.getDate() - 28);

    // Obtener todos los platos
    const platos = await this.platoModel.find();

    // Filtrar platos por categoría
    const platosFondo = platos.filter(plato => plato.categoria === 'PLATO DE FONDO');
    const platosRestrictivos = platos.filter(plato =>
      ['VEGETARIANO', 'VEGANA', 'GUARNICIÓN', 'HIPOCALORICO'].includes(plato.categoria),
    );
    const ensaladas = platos.filter(plato => plato.categoria === 'ENSALADA');
    const sopas = platos.filter(plato => plato.categoria === 'SOPA' || plato.categoria === 'CREMAS');
    const postres = platos.filter(plato => plato.categoria === 'POSTRES');

    // Verificar si existen platos de fondo repetidos en las últimas 12 semanas
    const platosFondoRepetidos = await this.model.find({
      fecha: { $gte: fechaInicio12Semanas, $lt: fechaInicio },
      'listaplatos': { $in: platosFondo.map(plato => plato._id) },
    });

    // Verificar si existen platos restrictivos repetidos en las últimas 4 semanas
    const platosRestrictivosRepetidos = await this.model.find({
      fecha: { $gte: fechaInicio4Semanas, $lt: fechaInicio },
      'listaplatos': { $in: platosRestrictivos.map(plato => plato._id) },
    });

    // Verificar si existen combinaciones de ensaladas repetidas en las últimas 4 semanas
    const combinacionesEnsaladasRepetidas = await this.model.find({
      fecha: { $gte: fechaInicio4Semanas, $lt: fechaInicio },
      'listaplatos': { $all: ensaladas.map(plato => plato._id) },
    });

    // Filtrar platos que no están disponibles
    const platosFondoDisponibles = platosFondo.filter(plato =>
      !platosFondoRepetidos.some(menu =>
        menu.listaplatos.some(listaPlato => listaPlato.toString() === plato._id.toString()),
      ),
    );

    const platosRestrictivosDisponibles = platosRestrictivos.filter(plato =>
      !platosRestrictivosRepetidos.some(menu =>
        menu.listaplatos.some(listaPlato => listaPlato.toString() === plato._id.toString()),
      ),
    );

    const ensaladasDisponibles = ensaladas.filter(plato =>
      !combinacionesEnsaladasRepetidas.some(menu =>
        menu.listaplatos.some(listaPlato => listaPlato.toString() === plato._id.toString()),
      ),
    );

    // Devolver los platos que están disponibles, incluyendo sopas y postres
    return [
      ...platosFondoDisponibles,
      ...platosRestrictivosDisponibles,
      ...ensaladasDisponibles,
      ...sopas,
      ...postres,
    ];
  }
  async obtenerPlatosPorFechaSucursal({
    fechaInicio,
    fechaFin,
    sucursalId,
  }: {
    fechaInicio: Date | null;
    fechaFin: Date | null;
    sucursalId: string;
  }) {
    const filtro: any = {};
  
    // Agregar filtro por sucursal
    if (sucursalId) {
      filtro.id_sucursal = sucursalId;
    }
  
    // Agregar filtro por fechas
    if (fechaInicio) {
      filtro.fecha = { $gte: fechaInicio };
    }
    if (fechaFin) {
      filtro.fecha = { ...filtro.fecha, $lte: fechaFin };
    }
  
    // Consultar los menús con los filtros aplicados
    const menus = await this.model
      .find(filtro)
      .populate('listaplatos')
      .exec();
  
    // Formatear la respuesta para incluir solo los datos requeridos
    return menus.map(menu => ({
      sucursal: menu.id_sucursal, // Incluye la sucursal en la respuesta
      fecha: menu.fecha,
      platos: menu.listaplatos.map(plato => ({
        id: plato._id,
        nombre: plato.nombre,
        descripcion: plato.descripcion,
      })),
    }));
  }

  // Lógica para el segundo endpoint
  async calcularIngredientesPorPeriodo(filtro: {
    fechaInicio: Date;
    fechaFin: Date;
    sucursalId: string;
    platosConCantidad: { fecha: string; platoId: string; cantidad: number }[];
  }) {
    const { fechaInicio, fechaFin, sucursalId, platosConCantidad } = filtro;

    // Resultados acumulados de ingredientes
    const reporteInsumos = [];

    // Iterar sobre los platos con cantidad
    for (const platoData of platosConCantidad) {
      const { platoId, cantidad } = platoData;

      // Obtener ingredientes asociados al plato
      const ingredientesDelPlato = await this.ingredientexplatoModel
        .find({ id_plato: platoId })
        .populate('id_ingrediente'); // Popula el ingrediente con su información

      // Iterar sobre los ingredientes del plato
      for (const ingredienteData of ingredientesDelPlato) {
        const { id_ingrediente, porcion_neta, peso_bruto, rendimiento } = ingredienteData;
        const ingrediente = id_ingrediente as IIngrediente;

        // Calcular la cantidad de ingrediente necesario
        const cantidadIngrediente = cantidad * (porcion_neta || 1); // Ajusta según el cálculo de porción

        // Verificar si el ingrediente ya está en el reporte, para acumular
        const indexIngrediente = reporteInsumos.findIndex(
          (item) => item.ingredienteId.toString() === ingrediente._id.toString(),
        );

        if (indexIngrediente !== -1) {
          // Acumular cantidad de ingrediente
          reporteInsumos[indexIngrediente].cantidad += cantidadIngrediente;
        } else {
          // Si no está, agregarlo al reporte
          reporteInsumos.push({
            ingredienteId: ingrediente._id,
            nombreIngrediente: ingrediente.nombreIngrediente,
            unidadMedida: ingrediente.unidadmedida,
            cantidad: cantidadIngrediente,
          });
        }
      }
    }

    return reporteInsumos;
  }
}




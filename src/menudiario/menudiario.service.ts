import { MenuDTO } from './dto/menudiario.dto';
import { INGREDIENTEXPLATO, MENUDIARIO, PLATO } from '../common/models/models';
import { Injectable, HttpStatus, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMenudiario } from 'src/common/interfaces/menudiario.interface';
import { IIngredientexplato } from 'src/common/interfaces/ingredientexplato.interface';
import { IPlato } from 'src/common/interfaces/plato.interface';
import { IIngrediente } from 'src/common/interfaces/ingrediente.interface';
import { PlatoFilaDTO } from './dto/platofila.dto';

@Injectable()
export class MenuDiarioService {
  constructor(
    @InjectModel(MENUDIARIO.name)
    private readonly model: Model<IMenudiario>,
     @InjectModel( INGREDIENTEXPLATO.name) private readonly ingredientexplatoModel: Model<IIngredientexplato>,
     @InjectModel(PLATO.name) // Inyectamos el modelo de Plato para hacer consultas sobre ellos
     private readonly platoModel: Model<IPlato>,  
  ) {}



  async create(menuDTO: MenuDTO): Promise<IMenudiario> {
    const last12Weeks = new Date();
    last12Weeks.setDate(last12Weeks.getDate() - 84); // 12 semanas atrás

    const last4Weeks = new Date();
    last4Weeks.setDate(last4Weeks.getDate() - 28); // 4 semanas atrás

    // Validar si ya existe un menú con la misma fecha, semana y sucursal
    const existingMenu = await this.model.findOne({
        fecha: menuDTO.fecha,
        semana: menuDTO.semana,
        id_sucursal: menuDTO.id_sucursal,
    });
    if (existingMenu) {
        throw new BadRequestException('Ya existe un menú registrado con esta fecha, semana y sucursal.');
    }

    // Obtener los platos por sus IDs
    const platosIds = menuDTO.listaplatos.map(item => item.platoId); // Extraemos los platoId de la lista
    const platos = await this.platoModel.find({
        '_id': { $in: platosIds }
    });

    // Clasificar los platos según su categoría
    const platosFondoIds = platos
        .filter(plato => plato.categoria === 'PLATO DE FONDO')
        .map(plato => plato._id.toString());

    const platosRestrictivosIds = platos
        .filter(plato => ['VEGETARIANO', 'VEGANA', 'GUARNICIÓN'].includes(plato.categoria))
        .map(plato => plato._id.toString());

    const otrosPlatosIds = platos
        .filter(plato => !['PLATO DE FONDO', 'VEGETARIANO', 'VEGANA', 'GUARNICIÓN'].includes(plato.categoria))
        .map(plato => plato._id.toString());

    const platosEnsalada = platos.filter(plato => plato.categoria === 'ENSALADA');

    // Validar que las ensaladas no se repitan en las últimas 4 semanas
    if (platosEnsalada.length > 0) {
        const platosEnsaladaIds = platosEnsalada.map(plato => plato._id.toString());

        const existingPlatoEnsalada = await this.model.findOne({
            createdAt: { $gte: last4Weeks },
            listaplatos: {
                $elemMatch: {
                    platoId: { $in: platosEnsaladaIds }
                }
            }
        });

        if (existingPlatoEnsalada) {
            throw new BadRequestException(
                'Un menú con el mismo conjunto de ensaladas ya existe en las últimas 4 semanas.',
            );
        }
    }

    // Verificar que no se repitan platos de fondo en las últimas 12 semanas
    const existingPlatoFondo = await this.model.findOne({
        createdAt: { $gte: last12Weeks },
        listaplatos: {
            $elemMatch: {
                platoId: { $in: platosFondoIds }
            }
        }
    });

    if (existingPlatoFondo) {
        throw new BadRequestException(
            'Un menú con los mismos platos de fondo ya existe en las últimas 12 semanas.',
        );
    }

    // Verificar que no se repitan platos restrictivos en las últimas 4 semanas
    const existingPlatoRestrictivo = await this.model.findOne({
        createdAt: { $gte: last4Weeks },
        listaplatos: {
            $elemMatch: {
                platoId: { $in: platosRestrictivosIds }
            }
        }
    });

    if (existingPlatoRestrictivo) {
        throw new BadRequestException(
            'Un menú con los mismos platos vegetarianos, veganos o de guarnición ya existe en las últimas 4 semanas.',
        );
    }

    // Verificar que no haya platos repetidos en `listaplatos`, exceptuando los vegetales y veganos
    const uniquePlatos = new Set(menuDTO.listaplatos.map(item => item.platoId.toString()));

    // Obtener los platos por su ID para verificar las categorías
    const platosVegetarianosYVeganos = menuDTO.listaplatos.filter(item => 
        ['VEGETARIANO', 'VEGANA'].includes(platos.find(plato => plato._id.toString() === item.platoId).categoria)
    );

    if (uniquePlatos.size !== menuDTO.listaplatos.length) {
        // Filtra los platos que son vegetarianos y veganos
        const vegetarianosYVeganosIds = platosVegetarianosYVeganos
            .map(item => item.platoId.toString());

        // Si la cantidad de platos vegetarianos y veganos es mayor que 1, considera que son los mismos
        if (vegetarianosYVeganosIds.length === 1) {
            // Se permite si solo hay un plato repetido entre vegetariano y vegano
            if (new Set(vegetarianosYVeganosIds).size === 1) {
                return;  // No lanzar excepción si hay un solo plato
            }
        }

    }

    // Si no hay errores, crear el nuevo menú
    const newMenu = new this.model(menuDTO);
    return await newMenu.save();
}


async findAll(): Promise<IMenudiario[]> {
  return await this.model.find()
    .populate({
      path: 'listaplatos',
      populate: {
        path: 'platoId',
        model: PLATO.name, 
      }
    })
    .populate('id_sucursal')
    .exec();
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
  async addPlato(id_menu: string, platoFila: PlatoFilaDTO): Promise<IMenudiario> {
    // Verificar si el menú existe
    const menu = await this.model.findById(id_menu);
    if (!menu) {
      throw new BadRequestException(`Menú con ID ${id_menu} no encontrado.`);
    }

    // Verificar si el plato existe
    const plato = await this.platoModel.findById(platoFila.platoId);
    if (!plato) {
      throw new BadRequestException(`Plato con ID ${platoFila.platoId} no encontrado.`);
    }

    // Añadir el plato con su fila al array listaplatos
    return await this.model.findByIdAndUpdate(
      id_menu,
      {
        $addToSet: {
          listaplatos: {
            platoId: platoFila.platoId,
            fila: platoFila.fila
          }
        },
      },
      { new: true },
    ).populate({
      path: 'listaplatos.platoId',
      model: PLATO.name,
    });
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
      'listaplatos.platoId': { $in: platosFondo.map(plato => plato._id) },
    });

    // Verificar si existen platos restrictivos repetidos en las últimas 4 semanas
    const platosRestrictivosRepetidos = await this.model.find({
      fecha: { $gte: fechaInicio4Semanas, $lt: fechaInicio },
      'listaplatos.platoId': { $in: platosRestrictivos.map(plato => plato._id) },
    });

    // Verificar si existen combinaciones de ensaladas repetidas en las últimas 4 semanas
    const combinacionesEnsaladasRepetidas = await this.model.find({
      fecha: { $gte: fechaInicio4Semanas, $lt: fechaInicio },
      'listaplatos.platoId': { $all: ensaladas.map(plato => plato._id) },
    });

    // Filtrar platos que no están disponibles
    const platosFondoDisponibles = platosFondo.filter(plato =>
      !platosFondoRepetidos.some(menu =>
        menu.listaplatos.some(listaPlato => listaPlato.platoId.toString() === plato._id.toString()),
      )
    );

    const platosRestrictivosDisponibles = platosRestrictivos.filter(plato =>
      !platosRestrictivosRepetidos.some(menu =>
        menu.listaplatos.some(listaPlato => listaPlato.toString() === plato._id.toString()),
      ),
    );

    const ensaladasDisponibles = ensaladas.filter(plato =>
      !combinacionesEnsaladasRepetidas.some(menu =>
        menu.listaplatos.some(listaPlato => listaPlato.platoId.toString() === plato._id.toString()),
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
  
    // Filtrar por sucursal
    if (sucursalId) {
      filtro.id_sucursal = sucursalId;
    }
  
    if (fechaInicio && fechaFin) {
      // Ajustar fechaInicio y fechaFin a UTC (00:00:00 y 23:59:59.999)
      fechaInicio.setHours(0, 0, 0, 0);  // Al inicio del día (00:00:00)
      fechaFin.setHours(23, 59, 59, 999); // Al final del día (23:59:59.999)
    
      // Convertir las fechas a UTC antes de la consulta
      const fechaInicioUTC = new Date(Date.UTC(fechaInicio.getUTCFullYear(), fechaInicio.getUTCMonth(), fechaInicio.getUTCDate(), 0, 0, 0, 0));
      const fechaFinUTC = new Date(Date.UTC(fechaFin.getUTCFullYear(), fechaFin.getUTCMonth(), fechaFin.getUTCDate(), 23, 59, 59, 999));
    
      filtro.fecha = { $gte: fechaInicioUTC, $lte: fechaFinUTC };
    } else if (fechaInicio) {
      // Ajustar solo fechaInicio a UTC
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaInicioUTC = new Date(Date.UTC(fechaInicio.getUTCFullYear(), fechaInicio.getUTCMonth(), fechaInicio.getUTCDate(), 0, 0, 0, 0));
      filtro.fecha = { $gte: fechaInicioUTC };
    } else if (fechaFin) {
      // Ajustar solo fechaFin a UTC
      fechaFin.setHours(23, 59, 59, 999);
      const fechaFinUTC = new Date(Date.UTC(fechaFin.getUTCFullYear(), fechaFin.getUTCMonth(), fechaFin.getUTCDate(), 23, 59, 59, 999));
      filtro.fecha = { $lte: fechaFinUTC };
    }
      
      
  
    // Realizar la consulta con el filtro y populando los platos
    const menus = await this.model
      .find(filtro)
      .populate({
        path: 'listaplatos',
        populate: { 
          path: 'platoId',
          model: PLATO.name 
        }
      })
      .exec();
  
    // Devolver los datos de los platos
    return menus.map(menu => ({
      sucursal: menu.id_sucursal,
      fecha: menu.fecha,
      platos: menu.listaplatos.map(item => ({
        id: item.platoId._id,
        nombre: item.platoId.nombre,
        descripcion: item.platoId.descripcion,
      })),
    }));
  }

async calcularIngredientesPorPeriodo(filtro: {
  fechaInicio: Date;
  fechaFin: Date;
  sucursalId: string;
  platosConCantidad: { fecha: string; platoId: string; cantidad: number }[];
}) {
  const { fechaInicio, fechaFin, sucursalId, platosConCantidad } = filtro;

  const reporteInsumos = [];

  const rangoFechas = {
    fechaInicio: fechaInicio
      ? new Date(
          fechaInicio.getFullYear(),
          fechaInicio.getMonth(),
          fechaInicio.getDate(),
          23, 0, 0, 0 
        )
      : null,
    fechaFin: fechaFin
      ? new Date(
          fechaFin.getFullYear(),
          fechaFin.getMonth(),
          fechaFin.getDate(),
          23, 0, 0, 0 
        )
      : null,
  };


  console.log(fechaFin,fechaInicio)
  for (const platoData of platosConCantidad) {
    const { platoId, cantidad } = platoData;

    const ingredientesDelPlato = await this.ingredientexplatoModel
      .find({ id_plato: platoId })
      .populate('id_ingrediente');

    for (const ingredienteData of ingredientesDelPlato) {
      const { id_ingrediente, peso_bruto } = ingredienteData;
      const ingrediente = id_ingrediente as IIngrediente;

      
      const cantidadIngrediente = cantidad * (peso_bruto || 1);

      const indexIngrediente = reporteInsumos.findIndex(
        (item) => item.ingredienteId.toString() === ingrediente._id.toString(),
      );

      if (indexIngrediente !== -1) {
        reporteInsumos[indexIngrediente].cantidad += cantidadIngrediente;
      } else {
        console.log("nazi")
        console.log(rangoFechas)
        reporteInsumos.push({
          ingredienteId: ingrediente._id,
          nombreIngrediente: ingrediente.nombreIngrediente,
          unidadMedida: ingrediente.unidadmedida,
          cantidad: cantidadIngrediente,
          fechaInicio: rangoFechas.fechaInicio,
          fechaFin: rangoFechas.fechaFin
        });
      }
    }
  }
  console.log(reporteInsumos)
  return reporteInsumos;
}
  }





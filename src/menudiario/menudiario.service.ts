import { MenuDTO } from './dto/menudiario.dto';
import { INGREDIENTEXPLATO, MENUDIARIO, PLATO } from '../common/models/models';
import { Injectable, HttpStatus, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId } from 'mongoose';
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
    const { fecha, semana, year, id_sucursal } = menuDTO;
  
    // Validar si ya existe un menú con la misma fecha, semana, año y sucursal
    const existingMenu = await this.model.findOne({
      fecha,
      semana,
      year,
      id_sucursal,
    });
  
    if (existingMenu) {
      throw new BadRequestException(
        'Ya existe un menú registrado con esta fecha, semana, año y sucursal.'
      );
    }
  
    // Obtener los platos por sus IDs
    const platosIds = menuDTO.listaplatos.map((item) => item.platoId);
    const platos = await this.platoModel.find({
      '_id': { $in: platosIds },
    });
  
    // Clasificar los platos según su categoría
    const platosFondoIds = platos
      .filter((plato) => plato.categoria === 'PLATO DE FONDO')
      .map((plato) => plato._id.toString());
  
    const platosRestrictivosIds = platos
      .filter((plato) =>
        ['VEGANA/VEGETARIANA', 'GUARNICIÓN'].includes(plato.categoria)
      )
      .map((plato) => plato._id.toString());
  
    // Validar que los platos de fondo no se repitan en las últimas 12 semanas
    const last12Weeks = new Date(fecha);
    last12Weeks.setDate(last12Weeks.getDate() - 84); // 12 semanas atrás
  
    const existingPlatoFondo = await this.model.findOne({
      fecha: { $gte: last12Weeks },
      id_sucursal,
      listaplatos: {
        $elemMatch: {
          platoId: { $in: platosFondoIds },
        },
      },
    });
  
    if (existingPlatoFondo) {
      throw new BadRequestException(
        `El plato ${existingPlatoFondo.nombre} ya existe en las últimas 12 semanas para esta sucursal.`
      );
    }
  
    // Validar que los platos restrictivos no se repitan en las últimas 4 semanas
    const last4Weeks = new Date(fecha);
    last4Weeks.setDate(last4Weeks.getDate() - 28); // 4 semanas atrás
  
    const existingPlatoRestrictivo = await this.model.findOne({
      fecha: { $gte: last4Weeks },
      id_sucursal,
      listaplatos: {
        $elemMatch: {
          platoId: { $in: platosRestrictivosIds },
        },
      },
    });
  
    if (existingPlatoRestrictivo) {
      throw new BadRequestException(
        'Un menú con los mismos platos vegetarianos, veganos o de guarnición ya existe en las últimas 4 semanas para esta sucursal.'
      );
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
    return this.model.find({ aprobado: false }).populate('id_sucursal').exec();
  }

  async aprobarMenu(id: string, aprobado: boolean) {
    return this.model.findByIdAndUpdate(id, { aprobado }, { new: true }).exec();
  }

  async getPlatosDisponiblesPorFecha(fecha: Date, id_sucursal: String): Promise<IPlato[]> {
    // Crear las fechas de referencia para las últimas 12 y 4 semanas
    const fechaInicio12Semanas = new Date(fecha);
    fechaInicio12Semanas.setUTCDate(fechaInicio12Semanas.getUTCDate() - 46);

    const fechaInicio4Semanas = new Date(fecha);
    fechaInicio4Semanas.setUTCDate(fechaInicio4Semanas.getUTCDate() - 28);

    // Obtener todos los platos no descontinuados
    const platos = await this.platoModel.find({ descontinuado: false });

    // Clasificar los platos según la categoría
    const platosFondo = platos.filter(plato => plato.categoria === 'PLATO DE FONDO');
    const platosRestrictivos = platos.filter(plato =>
      ['VEGANA/VEGETARIANA', 'GUARNICIÓN', 'HIPOCALORICO'].includes(plato.categoria),
    );
    const ensaladas = platos.filter(plato => plato.categoria === 'ENSALADA');
    const sopas = platos.filter(plato => ['SOPA', 'CREMAS'].includes(plato.categoria));
    const postres = platos.filter(plato => plato.categoria === 'POSTRES');

    // Obtener los IDs de los platos para las consultas
    const idsPlatosFondo = platosFondo.map(plato => plato._id.toString());
    const idsPlatosRestrictivos = platosRestrictivos.map(plato => plato._id.toString());
    const idsEnsaladas = ensaladas.map(plato => plato._id.toString());

    // Buscar platos repetidos según las fechas y categorías
    const [
      platosFondoRepetidos,
      platosRestrictivosRepetidos,
      ensaladasRepetidas,
    ] = await Promise.all([
      this.model.find({
        fecha: { $gte: fechaInicio12Semanas, $lt: fecha },
        id_sucursal,
        'listaplatos.platoId': { $in: idsPlatosFondo },
      }),
      this.model.find({
        fecha: { $gte: fechaInicio4Semanas, $lt: fecha },
        id_sucursal,
        'listaplatos.platoId': { $in: idsPlatosRestrictivos },
      }),
      this.model.find({
        fecha: { $gte: fechaInicio4Semanas, $lt: fecha },
        id_sucursal,
        'listaplatos.platoId': { $in: idsEnsaladas },
      }),
    ]);

    // Extraer IDs de los platos repetidos
    const idsFondoRepetidos = new Set(
      platosFondoRepetidos.flatMap(menu =>
        menu.listaplatos.map(listaPlato => listaPlato.platoId.toString()),
      ),
    );
    const idsRestrictivosRepetidos = new Set(
      platosRestrictivosRepetidos.flatMap(menu =>
        menu.listaplatos.map(listaPlato => listaPlato.platoId.toString()),
      ),
    );
    const idsEnsaladasRepetidas = new Set(
      ensaladasRepetidas.flatMap(menu =>
        menu.listaplatos.map(listaPlato => listaPlato.platoId.toString()),
      ),
    );

    // Filtrar platos disponibles eliminando los repetidos
    const platosFondoDisponibles = platosFondo.filter(plato => !idsFondoRepetidos.has(plato._id.toString()));
    const platosRestrictivosDisponibles = platosRestrictivos.filter(
      plato => !idsRestrictivosRepetidos.has(plato._id.toString()),
    );
    const ensaladasDisponibles = ensaladas.filter(plato => !idsEnsaladasRepetidas.has(plato._id.toString()));

    // Combinar y devolver los platos disponibles, incluyendo sopas y postres
    const platosDisponibles = [
      ...platosFondoDisponibles,
      ...platosRestrictivosDisponibles,
      ...ensaladasDisponibles,
      ...sopas,
      ...postres,
    ];

    return platosDisponibles;
  }

  async obtenerPlatosPorFechaSucursal({
    fechaInicio,
    fechaFin,
    sucursalId,
  }: {
    fechaInicio: Date | null;
    fechaFin: Date | null;
    sucursalId: string | null;
  }) {
    const filtro: any = {};
  
    if (fechaInicio && fechaFin) {
      fechaInicio.setHours(0, 0, 0, 0);
      fechaFin.setHours(23, 59, 59, 999);
  
      filtro.fecha = { $gte: fechaInicio, $lte: fechaFin };
    } else if (fechaInicio) {
      fechaInicio.setHours(0, 0, 0, 0);
      filtro.fecha = { $gte: fechaInicio };
    } else if (fechaFin) {
      fechaFin.setHours(23, 59, 59, 999);
      filtro.fecha = { $lte: fechaFin };
    }
  
    if (sucursalId) {
      filtro.id_sucursal = sucursalId; 
      filtro.aprobado = true; 
    }
  
    const menus = await this.model
    .find(filtro)
    .populate({
      path: 'listaplatos',
      populate: {
        path: 'platoId',
        model: 'platos',
      },
    })
    .exec()
    .catch((error) => {
      console.error("Error al poblar platos:", error);
      throw new InternalServerErrorException("Error al cargar detalles de los platos.");
    });
  
    return menus.map(menu => ({
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
    
    return reporteInsumos;
  }

  async validateBatch(menusDTO: MenuDTO[]): Promise<any> {
    const errors = [];
  
    for (let i = 0; i < menusDTO.length; i++) {
      try {
        await this.validarMenu(menusDTO[i]);
      } catch (error) {
        errors.push({ index: i, error: error.message });
      }
    }
  
    return errors;
  }
  

  async validarMenu(menuDTO: MenuDTO): Promise<void> {
    const last12Weeks = new Date(menuDTO.fecha);
    last12Weeks.setDate(last12Weeks.getDate() - 84); // 12 semanas atrás
    const last4Weeks = new Date(menuDTO.fecha);
    last4Weeks.setDate(last4Weeks.getDate() - 28); // 4 semanas atrás
    
    // Validar si ya existe un menú con la misma fecha, semana, año y sucursal
    const { fecha, semana, year, id_sucursal } = menuDTO;

    const existingMenu = await this.model.findOne({
      fecha,
      semana,
      year,
      id_sucursal,
    });
    
    if (existingMenu) {
      throw new BadRequestException('Ya existe un menú registrado con esta fecha, semana, año y sucursal.');
    }

    // Obtener los platos por sus IDs
    const platosIds = menuDTO.listaplatos.map(item => item.platoId);
    const platos = await this.platoModel.find({
      '_id': { $in: platosIds }
    });

    // Clasificar los platos según su categoría
    const platosFondoIds = platos
      .filter(plato => plato.categoria === 'PLATO DE FONDO')
      .map(plato => plato._id.toString());

    const platosRestrictivosIds = platos
      .filter(plato => ['VEGANA/VEGETARIANA', 'GUARNICIÓN'].includes(plato.categoria))
      .map(plato => plato._id.toString());

    const platosEnsalada = platos.filter(plato => plato.categoria === 'ENSALADA');

    // Validar que las ensaladas no se repitan en las últimas 4 semanas
    if (platosEnsalada.length > 0) {
      const platosEnsaladaIds = platosEnsalada.map(plato => plato._id.toString());

      const existingPlatoEnsalada = await this.model.findOne({
        fecha: { $gte: last4Weeks },
        id_sucursal, 
        listaplatos: {
          $elemMatch: {
            platoId: { $in: platosEnsaladaIds }
          }
        }
      });

      if (existingPlatoEnsalada) {
        throw new BadRequestException(
          'Un menú con el mismo conjunto de ensaladas ya existe en las últimas 4 semanas del mismo año.',
        );
      }
    }

    // Validar que los platos de fondo no se repitan en las últimas 12 semanas
    const existingPlatoFondo = await this.model.findOne({
        fecha: { $gte: last12Weeks },
        id_sucursal, 
        listaplatos: {
            $elemMatch: {
                platoId: { $in: platosFondoIds }
            }
        }
    });

    if (existingPlatoFondo) {
        throw new BadRequestException(
          `El plato ${existingPlatoFondo.nombre} ya existe en las ultimas 12 semanas`,
        );
    }

    // Validar que los platos restrictivos no se repitan en las últimas 4 semanas
    const existingPlatoRestrictivo = await this.model.findOne({
        fecha: { $gte: last4Weeks },
        id_sucursal, 
        listaplatos: {
            $elemMatch: {
                platoId: { $in: platosRestrictivosIds }
            }
        }
    });

    if (existingPlatoRestrictivo) {
        throw new BadRequestException(
          `El plato ${existingPlatoRestrictivo.nombre} ya existe en las ultimas 4 semanas`,
        );
    }
  }


  async updateMensaje(id: string, mensaje: string): Promise<IMenudiario> {
    const menu = await this.model.findById(id);
    if (!menu) {
      throw new BadRequestException('Menú no encontrado');
    }
  
    menu.mensaje = mensaje; // Actualizamos solo el atributo mensaje
    return await menu.save(); // Guardamos los cambios en la base de datos
  }
}
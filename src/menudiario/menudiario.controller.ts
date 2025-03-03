import {  MenuDTO } from './dto/menudiario.dto';
import {  MenuDiarioService } from './menudiario.service';
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  HttpException,
  HttpStatus,
  UseGuards,
  BadRequestException,
  Query,
  Patch,
  Res,
} from '@nestjs/common';
import { PlatoService } from 'src/plato/plato.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { IMenudiario } from 'src/common/interfaces/menudiario.interface';
import { IPlato } from 'src/common/interfaces/plato.interface';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { EstructuraService } from 'src/estructura/estructura.service';
import mongoose, { ObjectId, Types } from 'mongoose';

@ApiTags('Menu Diario')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/menudiario')
export class MenuDiarioController {
  constructor(
    private readonly menuService: MenuDiarioService,
    private readonly platoService: PlatoService,
    private readonly estructuraService: EstructuraService
  ) {}

  @Post()
  create(@Body() menuDTO: MenuDTO) {
    return this.menuService.create(menuDTO);
  }

  @Get()
  findAll() {
    return this.menuService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
   return this.menuService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() menuDTO: MenuDTO) {
    return this.menuService.update(id, menuDTO);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.menuService.delete(id);
  }

  @Post(':menuId/plato/:platoId')
  async addPlato(
    @Param('menuId') menuId: string,
    @Param('platoId') platoId: string,
    @Param('fila') fila: string,
  ) {
    const plato = await this.platoService.findOne(platoId);
    if (!plato)
      throw new HttpException('Passenger Not Found', HttpStatus.NOT_FOUND);

    return this.menuService.addPlato(menuId, { platoId, fila });
  }

 
  
  @Get('generar-reporte/platos-entre-fechas')
  async getPlatosEntreFechas(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    const startDate = new Date(fechaInicio);
    const endDate = new Date(fechaFin);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Las fechas proporcionadas no son válidas.');
    }

    if (startDate > endDate) {
      throw new BadRequestException('La fecha de inicio no puede ser posterior a la fecha de fin.');
    }

    const platos = await this.menuService.getPlatosEntreFechas(startDate, endDate);
    return platos;
  }

  // Ruta para obtener los menús no aprobados
  @Get('verificar/no-aprobados')
  async getMenusNoAprobados(): Promise<IMenudiario[]> {
    return this.menuService.getMenusNoAprobados();
  }

  @Patch('Verificar/aprobado/:id')
  async aprobarMenu(@Param('id') id: string, @Body() body: { aprobado: boolean }) {
    return this.menuService.aprobarMenu(id, body.aprobado);
  }

  @Get('Verificar/platos-disponibles')
  async getPlatosDisponibles(
    @Query('fecha') fecha: string,
    @Query('filtrar') filtrar?: string, // 'true' o 'false'
    @Query('semana') semana?: string,
    @Query('dia') dia?: string,
    @Query('sucursal') id_sucursal?: string,
  ): Promise<any> {
    // Validación de la fecha
    if (!fecha) {
      throw new BadRequestException('Debe proporcionar una fecha válida.');
    }
    const parsedFecha = new Date(fecha);
    if (isNaN(parsedFecha.getTime())) {
      throw new BadRequestException('Formato de fecha no válido.');
    }

    // Obtener la lista de platos disponibles según la lógica actual
    const platos = await this.menuService.getPlatosDisponiblesPorFecha(parsedFecha, id_sucursal);
    // Si se solicita filtrado extra...
    if (filtrar && filtrar.toLowerCase() === 'true') {
      // Se requieren los parámetros semana y día para poder buscar la estructura
      if (!semana || !dia) {
        throw new BadRequestException(
          'Debe proporcionar los parámetros "semana" y "dia" para filtrar por estructura.',
        );
      }

      // Consultamos la estructura para la semana y día indicados
      const estructuras = await this.estructuraService.getEstructuraBySemanaAndDia(semana, dia);

      if (!estructuras || estructuras.length === 0) {
        throw new BadRequestException(
          'No se encontró estructura para la semana y día proporcionados.',
        );
      }

      // Construir un array único de objetos con familia, corteqlo y categoría de la estructura
      const allowedStructures = Array.from(
        new Map(
          estructuras.map(e => [
            `${e.familia}-${e.corteqlo}-${e.categoria}`, // clave única
            { familia: e.familia, corteqlo: e.corteqlo, categoria: e.categoria },
          ]),
        ).values(),
      );

      /*
        Filtramos los platos para conservar aquellos que coincidan en familia y corteqlo
        con alguno de los registros permitidos en allowedStructures.
        Luego, mapeamos cada plato filtrado para retornar un objeto con la familia, corteqlo y,
        desde la estructura, la categoría correspondiente.
      */
        const platosFiltrados = platos
        .filter(plato => {
          // Verificar si la categoría del plato es "PLATO DE FONDO" o "GUARNICIÓN"
          if (plato.categoria !== "PLATO DE FONDO" && plato.categoria !== "GUARNICIÓN") {
            return plato;
          }
      
          // Luego, verificar si el plato cumple con alguna de las estructuras permitidas
          return allowedStructures.some(
            estructura =>
              (estructura.familia && estructura.familia === plato.familia) ||
              (estructura.corteqlo && estructura.corteqlo === plato.corteqlo),
          );
        })
        .map(plato => {
          // Buscar en allowedStructures la estructura que corresponda al plato
          const estructura = allowedStructures.find(
            s => s.familia === plato.familia && s.corteqlo === plato.corteqlo,
          );
          return plato;
        });
  
      return platosFiltrados;
    }

    // Si filtrar no es 'true', se retorna la lista completa sin modificaciones
    return platos;
  }


  @Get('reporte/obtener-platos')
  async obtenerPlatos(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('sucursalId') sucursalId: string,
  ) {
    return this.menuService.obtenerPlatosPorFechaSucursal({
      fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
      fechaFin: fechaFin ? new Date(fechaFin) : null,
      sucursalId: sucursalId,
    });
  }


  @Post('reporte/calcular-ingredientes')
  async calcularIngredientes(
    @Body() filtro: { fechaInicio: string; fechaFin: string; sucursalId: string; platosConCantidad: { fecha: string; platoId: string; cantidad: number }[] },
    @Res() res, // Para enviar la respuesta con el archivo Excel
  ) {
    const { fechaInicio, fechaFin, sucursalId, platosConCantidad } = filtro;
  
    // Obtener el reporte de insumos
    const reporteInsumos = await this.menuService.calcularIngredientesPorPeriodo({
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
      sucursalId,
      platosConCantidad,
    });
  
  
    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Ingredientes');
  
    // Definir las columnas
    worksheet.columns = [
      { header: 'Fecha Inicio', key: 'fechaInicio', width: 20 },
      { header: 'Fecha Fin', key: 'fechaFin', width: 20 },
      { header: 'Nombre Ingrediente', key: 'nombreIngrediente', width: 30 },
      { header: 'Cantidad', key: 'cantidad', width: 15 },
      { header: 'Unidad de Medida', key: 'unidadMedida', width: 20 },
    ];
  
    // Añadir datos al Excel
    let rowIndex = 2; // Empezamos desde la fila 2 (debajo del encabezado)
    reporteInsumos.forEach((item) => {
      const row = worksheet.addRow({
        fechaInicio: item.fechaInicio,
        fechaFin: item.fechaFin,
        nombreIngrediente: item.nombreIngrediente,
        unidadMedida: item.unidadMedida,
        cantidad: item.cantidad,
      });
  
      // Alternar colores de fondo
      const fillColor = rowIndex % 2 === 0 ? 'FFC6EFCE' : 'FFFFFFFF'; // Verde claro o blanco
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: fillColor },
        };
      });
  
      rowIndex++;
    });
  
    // Estilo del encabezado
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }, // Gris claro para el encabezado
      };
      cell.font = { bold: true };
    });
  
    // Guardar el archivo en la carpeta de descargas
    let downloadsPath;
    if (os.platform() === 'win32' || os.platform() === 'darwin') {
      downloadsPath = path.join(os.homedir(), 'Downloads');
    } else if (os.platform() === 'linux') {
      downloadsPath = path.join(os.homedir(), 'Descargas');
    } else {
      throw new Error('Sistema operativo no soportado para obtener la carpeta de descargas');
    }
  
    const folderPath = path.join(downloadsPath, 'archivos');
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true }); // Crear la carpeta si no existe
    }
  
    const fileName = `reporte_ingredientes_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`;
    const filePath = path.join(folderPath, fileName);
  
    try {
      // Guardar el archivo Excel
      await workbook.xlsx.writeFile(filePath);
  
      return res.json({
        message: 'Archivo generado correctamente',
        filePath: `/Reportes/${fileName}`,
      });
    } catch (error) {
      console.error('Error al guardar el archivo:', error);
      throw new Error('No se pudo generar el archivo Excel');
    }
  }

  @Post('/validate-menus')
  async validateMenus(@Body() menusDTO: MenuDTO[]): Promise<{ valid: boolean; errors: { index: number; error: string }[] }> {
    const errors = await this.menuService.validateBatch(menusDTO);

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  @Patch(':id/mensaje')
  async updateMensaje(
    @Param('id') id: string,
    @Body('mensaje') mensaje: string,
  ) {
    if (!mensaje || typeof mensaje !== 'string') {
      throw new BadRequestException('El atributo "mensaje" es obligatorio y debe ser una cadena de texto.');
    }

    return await this.menuService.updateMensaje(id, mensaje);
  }
}
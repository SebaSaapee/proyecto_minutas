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

@ApiTags('Menu Diario')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/menudiario')
export class MenuDiarioController {
  constructor(
    private readonly menuService: MenuDiarioService,
    private readonly platoService: PlatoService,
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
  async getPlatosDisponibles(@Query('fecha') fecha: string): Promise<IPlato[]> {
    if (!fecha) {
      throw new BadRequestException('Debe proporcionar una fecha válida.');
    }

    const parsedFecha = new Date(fecha);
    if (isNaN(parsedFecha.getTime())) {
      throw new BadRequestException('Formato de fecha no válido.');
    }

    return await this.menuService.getPlatosDisponiblesPorFecha(parsedFecha);
  }


  @Get('reporte/obtener-platos')
  async obtenerPlatos(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.menuService.obtenerPlatosPorFechaSucursal({
      fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
      fechaFin: fechaFin ? new Date(fechaFin) : null,
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
   console.log("controler")
   console.log(fechaInicio)

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte Ingredientes');

 
  worksheet.columns = [
    { header: 'Fecha Inicio', key: 'fechaInicio', width: 20 },
    { header: 'Fecha Fin', key: 'fechaFin', width: 20 },
    { header: 'Nombre Ingrediente', key: 'nombreIngrediente', width: 30 },
    { header: 'Cantidad', key: 'cantidad', width: 15 },
    { header: 'Unidad de Medida', key: 'unidadMedida', width: 20 },
  ];

  
  reporteInsumos.forEach((item) => {
    worksheet.addRow({
      fechaInicio: item.fechaInicio,
      fechaFin: item.fechaFin,
      nombreIngrediente: item.nombreIngrediente,
      unidadMedida: item.unidadMedida,
      cantidad: item.cantidad,
    });
  });

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
    fs.mkdirSync(folderPath, { recursive: true }); // 
  }

 
  const fileName = `reporte_ingredientes_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`;
  const filePath = path.join(folderPath, fileName);

  try {
    
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


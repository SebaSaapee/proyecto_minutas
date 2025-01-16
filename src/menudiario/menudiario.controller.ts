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
} from '@nestjs/common';
import { PlatoService } from 'src/plato/plato.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { IMenudiario } from 'src/common/interfaces/menudiario.interface';
import { IPlato } from 'src/common/interfaces/plato.interface';

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
  ) {
    const plato = await this.platoService.findOne(platoId);
    if (!plato)
      throw new HttpException('Passenger Not Found', HttpStatus.NOT_FOUND);

    return this.menuService.addPlato(menuId, platoId);
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
    @Query('sucursalId') sucursalId: string,
  ) {
    return this.menuService.obtenerPlatosPorFechaSucursal({
      fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
      fechaFin: fechaFin ? new Date(fechaFin) : null,
      sucursalId,
    });
  }

  @Post('reporte/calcular-ingredientes')
  async calcularIngredientes(
    @Body() filtro: { fechaInicio: string; fechaFin: string; sucursalId: string; platosConCantidad: { fecha: string; platoId: string; cantidad: number }[] },
  ) {
    const { fechaInicio, fechaFin, sucursalId, platosConCantidad } = filtro;
  
    return this.menuService.calcularIngredientesPorPeriodo({
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
      sucursalId,
      platosConCantidad,
    });
  }
  

}


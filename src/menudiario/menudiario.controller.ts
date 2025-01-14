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
} from '@nestjs/common';
import { PlatoService } from 'src/plato/plato.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

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

  @Post('generar-reporte')
  async generarReporte(
    @Body() filtro: { fechaInicio: string; fechaFin: string; sucursalId: string; platosConCantidad: { platoId: string; cantidad: number }[] },
  ) {
    const { fechaInicio, fechaFin, sucursalId, platosConCantidad } = filtro;

    // Se pasa todo lo recibido en el cuerpo del POST al servicio
    return this.menuService.calcularIngredientesPorPeriodo({
      fechaInicio: new Date(fechaInicio),   // Convertir fechaInicio a Date
      fechaFin: new Date(fechaFin),         // Convertir fechaFin a Date
      sucursalId,
      platosConCantidad,                    // Pasa la lista de platos con cantidad
    });
  }

  @Get('platos-entre-fechas')
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
}


import { SucursalService } from './sucursal.service';
import { SucursalDTO } from './dto/sucursal.dto';
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('sucursales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/sucursal')
export class SucursalController {
  constructor(private readonly sucursalService: SucursalService) {}

  @Post()
  @ApiOperation({ summary: 'Crear Sucursal' })
  create(@Body() sucursalDTO: SucursalDTO) {
    return this.sucursalService.create(sucursalDTO);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las sucursales' })
  findAll() {
    return this.sucursalService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener sucursal por ID' })
  findOne(@Param('id') id: string) {
    return this.sucursalService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar sucursal' })
  update(@Param('id') id: string, @Body() sucursalDTO: SucursalDTO) {
    return this.sucursalService.update(id, sucursalDTO);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar sucursal' })
  delete(@Param('id') id: string) {
    return this.sucursalService.delete(id);
  }
}
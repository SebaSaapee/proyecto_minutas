import { EstructuraService } from './estructura.service';
import { EstructuraDTO } from './dto/estructura.dto';
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

@ApiTags('estructuras')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/estructura')
export class EstructuraController {
  constructor(private readonly estructuraService: EstructuraService) {}

  @Post()
  @ApiOperation({ summary: 'Crear Estructura' })
  create(@Body() estructuraDTO: EstructuraDTO) {
    return this.estructuraService.create(estructuraDTO);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las estructuras' })
  findAll() {
    return this.estructuraService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener estructura por ID' })
  findOne(@Param('id') id: string) {
    return this.estructuraService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar estructura' })
  update(@Param('id') id: string, @Body() estructuraDTO: EstructuraDTO) {
    return this.estructuraService.update(id, estructuraDTO);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar estructura' })
  delete(@Param('id') id: string) {
    return this.estructuraService.delete(id);
  }
}

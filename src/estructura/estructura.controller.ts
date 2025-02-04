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

  @Put('semana/:semana')
  @ApiOperation({ summary: 'Actualizar estructuras por semana' })
  async updateBySemana(
    @Param('semana') semana: string,
    @Body() estructurasDTO: EstructuraDTO[],
  ): Promise<void> {
    return this.estructuraService.updateBySemana(semana, estructurasDTO);
  }
  
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar estructura' })
  delete(@Param('id') id: string) {
    return this.estructuraService.delete(id);
  }
  // Nuevo endpoint para obtener estructuras por semana y día
  @Get('semana/:semana/dia/:dia')
  @ApiOperation({ summary: 'Obtener estructuras por semana y día' })
  getBySemanaAndDia(
    @Param('semana') semana: string,
    @Param('dia') dia: string,
  ) {
    return this.estructuraService.getEstructuraBySemanaAndDia(semana, dia);
  }
  
}

import { IngredienteService } from './ingrediente.service';
import { IngredienteDTO } from './dto/ingrediente.dto';
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('ingredientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/ingrediente')
export class IngredienteController {
  constructor(private readonly ingredienteService: IngredienteService) {}

  @Post()
  @ApiOperation({ summary: 'Crear Ingrediente' })
  create(@Body() ingredienteDTO: IngredienteDTO) {
    return this.ingredienteService.create(ingredienteDTO);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los ingredientes' })
  findAll() {
    return this.ingredienteService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un ingrediente por ID' })
  findOne(@Param('id') id: string) {
    return this.ingredienteService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un ingrediente' })
  update(@Param('id') id: string, @Body() ingredienteDTO: IngredienteDTO) {
    return this.ingredienteService.update(id, ingredienteDTO);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un ingrediente' })
  delete(@Param('id') id: string) {
    return this.ingredienteService.delete(id);
  }

    // Nueva ruta para buscar ingredientes por nombre
    @Get('buscar/:nombre')
    @ApiOperation({ summary: 'Buscar ingredientes por nombre' })
    findByName(@Param('nombre') nombre: string) {
      return this.ingredienteService.findByName(nombre);
    }
}
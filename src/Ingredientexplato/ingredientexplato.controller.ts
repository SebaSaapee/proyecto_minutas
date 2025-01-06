import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IngredientexplatoService } from './ingredientexplato.service';
import { IngredientexplatoDTO } from './dto/ingredientexplato.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { IIngredientexplato } from 'src/common/interfaces/ingredientexplato.interface';

@ApiTags('ingredientexplato')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/ingredientexplato')
export class IngredientexplatoController {
  constructor(private readonly ingredientexplatoService: IngredientexplatoService) {}

  // Crear un nuevo ingredientexplato
  @Post()
  @ApiOperation({ summary: 'Crear un Ingredientexplato' })
  create(@Body() ingredientexplatoDTO: IngredientexplatoDTO): Promise<IIngredientexplato> {
    return this.ingredientexplatoService.create(ingredientexplatoDTO);
  }

  // Obtener todos los ingredientexplatos
  @Get()
  @ApiOperation({ summary: 'Obtener todos los Ingredientexplatos' })
  findAll(): Promise<IIngredientexplato[]> {
    return this.ingredientexplatoService.findAll();
  }

  // Obtener un ingredientexplato por ID
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un Ingredientexplato por ID' })
  findOne(@Param('id') id: string): Promise<IIngredientexplato> {
    return this.ingredientexplatoService.findOne(id);
  }

  // Actualizar un ingredientexplato por ID
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un Ingredientexplato' })
  update(@Param('id') id: string, @Body() ingredientexplatoDTO: IngredientexplatoDTO): Promise<IIngredientexplato> {
    return this.ingredientexplatoService.update(id, ingredientexplatoDTO);
  }

  // Eliminar un ingredientexplato por ID
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un Ingredientexplato' })
  delete(@Param('id') id: string) {
    return this.ingredientexplatoService.delete(id);
  }
}
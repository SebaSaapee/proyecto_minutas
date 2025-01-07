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
  import { RecetaService } from './receta.service';
  import { RecetaDTO } from './dto/receta.dto';
  
  @ApiTags('recetas')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('api/v1/receta')
  export class RecetaController {
    constructor(private readonly recetaService: RecetaService) {}
  
    @Post()
    @ApiOperation({ summary: 'Crear nueva receta' })
    create(@Body() recetaDTO: RecetaDTO) {
      return this.recetaService.create(recetaDTO);
    }
  
    @Get()
    @ApiOperation({ summary: 'Obtener todas las recetas' })
    findAll() {
      return this.recetaService.findAll();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Obtener receta por ID' })
    findOne(@Param('id') id: string) {
      return this.recetaService.findOne(id);
    }
  
    @Put(':id')
    @ApiOperation({ summary: 'Actualizar receta por ID' })
    update(@Param('id') id: string, @Body() recetaDTO: RecetaDTO) {
      return this.recetaService.update(id, recetaDTO);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar receta por ID' })
    delete(@Param('id') id: string) {
      return this.recetaService.delete(id);
    }
  }
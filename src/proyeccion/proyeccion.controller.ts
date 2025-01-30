import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
  } from '@nestjs/common';
  import { ProyeccionService } from './proyeccion.service';
  import { ProyeccionDTO } from './dto/proyeccion.dto';
  import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
  import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
  
  @ApiTags('Proyecciones')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('api/v1/proyeccion')
  export class ProyeccionController {
    constructor(private readonly proyeccionService: ProyeccionService) {}
  
    @Post()
    create(@Body() proyeccionDTO: ProyeccionDTO) {
      return this.proyeccionService.create(proyeccionDTO);
    }
  
    @Get()
    findAll() {
      return this.proyeccionService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.proyeccionService.findOne(id);
    }
  
    @Put(':id')
    update(@Param('id') id: string, @Body() proyeccionDTO: ProyeccionDTO) {
      return this.proyeccionService.update(id, proyeccionDTO);
    }
  
    @Delete(':id')
    delete(@Param('id') id: string) {
      return this.proyeccionService.delete(id);
    }

    @Get(':id/reporte-insumos')
    async generateIngredientReport(@Param('id') proyeccionId: string) {
        return this.proyeccionService.generateIngredientReportForProjection(proyeccionId);
    }
  }
  
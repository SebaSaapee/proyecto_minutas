import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    Res,
    UseGuards,
  } from '@nestjs/common';
  import { Response } from 'express';
  import * as ExcelJS from 'exceljs';
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
  async generateIngredientReport(
    @Param('id') proyeccionId: string,
    @Res() res: Response,
    @Query('fecha') fecha?: string,
  ) {
    try {
      // Generar el reporte usando el servicio
      const report = await this.proyeccionService.generateIngredientReportForProjection(proyeccionId, fecha? fecha : null);

      // Crear un nuevo libro de Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Reporte de Ingredientes');

      // Añadir encabezados
      const headers = ['Fecha Inicio', 'Fecha Fin', 'Ingrediente', 'Cantidad Total', 'Unidad de Medida'];
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' }, // Gris claro para el encabezado
        };
        cell.font = { bold: true };
      });

      // Añadir datos al Excel
      let rowIndex = 2; // Empezamos desde la fila 2 (debajo del encabezado)
      for (const ingrediente of report.ingredientes) {
        const row = worksheet.addRow([
          report.fechaInicio.toISOString().split('T')[0], // Fecha inicio (YYYY-MM-DD)
          report.fechaFin.toISOString().split('T')[0],    // Fecha fin (YYYY-MM-DD)
          ingrediente.nombreIngrediente,
          ingrediente.cantidadTotal,
          ingrediente.unidadMedida || 'N/A', // Si no hay unidad de medida, mostrar "N/A"
        ]);

        // Alternar colores de fondo
        const fillColor = rowIndex % 2 === 0 ? 'FFC6EFCE' : 'FFFFFFFF'; // Verde claro o blanco
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: fillColor },
          };
        });

        rowIndex++;
      }

      // Configurar ajustes de columna
      worksheet.columns.forEach((column) => {
        column.width = 25; // Ancho de columna
      });

      // Enviar el archivo Excel como respuesta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte_ingredientes.xlsx');

      // Escribir el archivo Excel en la respuesta
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error al generar el reporte:', error);
      res.status(500).send('Error al generar el reporte');
    }
  }
}
  
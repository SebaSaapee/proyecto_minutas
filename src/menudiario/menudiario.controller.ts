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
   // return this.menuService.findOne(id);
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
}

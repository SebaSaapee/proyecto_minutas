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
import {  PlatoService } from './plato.service';
import { PlatoDTO } from './dto/plato.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Platos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/plato')
export class PlatoController {
  constructor(private readonly platoService: PlatoService) {}

  @Post()
  create(@Body() platoDTO: PlatoDTO) {
    return this.platoService.create(platoDTO);
  }

  @Get()
  findAll() {
    return this.platoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.platoService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() platoDTO: PlatoDTO) {
    return this.platoService.update(id, platoDTO);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.platoService.delete(id);
  }
}

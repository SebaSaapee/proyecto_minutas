// src/menu-diario/dto/plato-fila.dto.ts (crea este nuevo archivo)
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsMongoId, isString } from 'class-validator';

export class PlatoFilaDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly platoId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly fila: string;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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
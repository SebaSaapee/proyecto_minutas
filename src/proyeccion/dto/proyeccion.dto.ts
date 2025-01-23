import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class ProyeccionDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  readonly fecha: Date;
  @ApiProperty()
  readonly lista: { Nombreplato: string; cantidad: string }[];
}
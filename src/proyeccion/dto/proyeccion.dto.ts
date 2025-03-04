import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class ProyeccionDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  readonly fecha: Date;

  @ApiProperty()
  @IsNotEmpty()
  readonly nombreSucursal: string;

  @ApiProperty()
  readonly lista: { platoid: string , fecha: string; Nombreplato: string; cantidad: string }[];
}
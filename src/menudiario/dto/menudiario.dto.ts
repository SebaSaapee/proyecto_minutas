import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class MenuDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly nombre: string;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  readonly fecha: Date; // Fecha de inicio



  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  readonly semana: number; // Número de semana


  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly id_sucursal: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly estado: string;

  @ApiProperty({ type: [String], description: 'Lista de IDs de platos' })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  readonly listaplatos: string[];
}
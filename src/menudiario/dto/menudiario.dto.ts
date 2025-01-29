import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PlatoFilaDTO } from './platofila.dto'; // Importa el nuevo DTO

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
  readonly year: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly estado: string;

  @ApiProperty({ type: [PlatoFilaDTO], description: 'Lista de platos con sus filas' })
  @IsNotEmpty()
  @IsArray()
  @Type(() => PlatoFilaDTO) // Usa el nuevo DTO
  readonly listaplatos: PlatoFilaDTO[]; // Ahora es un array de PlatoFilaDTO

  @ApiProperty()
  readonly mensaje: string;
}

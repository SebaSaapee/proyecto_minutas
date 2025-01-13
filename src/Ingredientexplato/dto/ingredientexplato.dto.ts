import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Double } from 'mongoose';
import { IIngrediente } from 'src/common/interfaces/ingrediente.interface';
import { IPlato } from 'src/common/interfaces/plato.interface';

export class IngredientexplatoDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly id_plato: IPlato;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly id_ingrediente: IIngrediente;
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  readonly porcion_neta: number;
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  readonly peso_bruto: number;
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  readonly rendimiento: number;
}

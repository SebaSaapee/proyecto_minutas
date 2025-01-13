import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IIngrediente } from 'src/common/interfaces/ingrediente.interface';
import { IPlato } from 'src/common/interfaces/plato.interface';

export class IngredientexplatoDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly id_plato: IPlato;
  @ApiProperty()
  
  @IsString()
  readonly id_ingrediente: IIngrediente;
  @ApiProperty()
  readonly porcion_neta: number;
  @ApiProperty()
  readonly peso_bruto: number;
  @ApiProperty()
  readonly rendimiento: number;
}

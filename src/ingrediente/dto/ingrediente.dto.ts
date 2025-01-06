import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString} from 'class-validator';

export class IngredienteDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly nombreIngrediente: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly unidadmedida: string;
 
}

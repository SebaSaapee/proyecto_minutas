import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString} from 'class-validator';
import { IPlato } from 'src/common/interfaces/plato.interface';


export class RecetaDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly nombreReceta: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly id_plato: IPlato;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly preparacion: string;
 
}
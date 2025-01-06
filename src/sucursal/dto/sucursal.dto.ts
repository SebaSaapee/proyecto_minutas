import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString} from 'class-validator';

export class SucursalDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly nombresucursal: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly direccion: string;
 
}

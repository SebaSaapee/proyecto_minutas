import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString} from 'class-validator';

export class PlatoDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly nombre: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly descripcion: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly categoria: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  readonly descontinuado: boolean;

}

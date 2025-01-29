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
  readonly categoria: string;
  @ApiProperty()
  readonly descontinuado: boolean;
  @ApiProperty()
  readonly familia: string;
  @ApiProperty()
  readonly tipo_corte: string;
  @ApiProperty()
  readonly temporada: string;


  
}

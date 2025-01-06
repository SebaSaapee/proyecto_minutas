import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class MenuDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly nombre: string;
  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  readonly fecha: Date;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly id_sucursal: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly estado: string;
}

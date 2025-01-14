import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

export class UserDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly password: string;

  @ApiProperty({
    enum: ['user', 'admin', 'logistica','gerencia'], // Documenta los valores permitidos
    default: 'user', // Valor por defecto que se muestra en Swagger
  })
  @IsOptional() // El campo es opcional, ya que tiene un valor por defecto
  @IsString()
  @IsIn(['user', 'admin', 'logistica','gerencia']) // Valida que sea uno de los valores permitidos
  readonly role?: string = 'user'; // Valor por defecto en el DTO
}

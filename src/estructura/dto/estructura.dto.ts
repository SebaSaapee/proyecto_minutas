import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

 export class EstructuraDTO{

    @ApiProperty()
    @IsNotEmpty()
    readonly dia: string;
    
    @ApiProperty()
    @IsNotEmpty()
    readonly semana: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly categoria: string;

    
    @ApiProperty()
   
    readonly familia: string;

    @ApiProperty()
    readonly corteqlo: string;
 }
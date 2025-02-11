import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PlatoModule } from './plato/plato.module';
import { MenuDiarioModule } from './menudiario/menudiario.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SucursalModule } from './sucursal/sucursal.module';
import { IngredienteModule } from './ingrediente/ingrediente.module';
import { IngredientexplatoModule } from './Ingredientexplato/ingredientexplato.module';
import { RecetaModule } from './receta/receta.module';
import { ServeStaticModule } from '@nestjs/serve-static';

import * as path from 'path';  // Asegúrate de que esta línea esté presente
import { ProyeccionModule } from './proyeccion/proyeccion.module';
import { EstructuraModule } from './estructura/estructura.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development'],
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.URI_MONGODB),
    UserModule,
    PlatoModule,
    MenuDiarioModule,
    AuthModule,
    SucursalModule,
    IngredienteModule,
    IngredientexplatoModule,
    RecetaModule,
    ProyeccionModule,
    EstructuraModule,

   
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
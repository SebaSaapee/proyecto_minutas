import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import {  PlatoModule } from './plato/plato.module';
import {  MenuDiarioModule } from './menudiario/menudiario.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SucursalModule } from './sucursal/sucursal.module';
import { IngredienteModule } from './ingrediente/ingrediente.module';
import { IngredientexplatoModule } from './Ingredientexplato/ingredientexplato.module';

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
    IngredientexplatoModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

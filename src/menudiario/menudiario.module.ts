import {  MENUDIARIO } from '../common/models/models';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

import { MenuDiarioService } from './menudiario.service';
import {  MenuDiarioSchema } from './schema/menudiario.schema';
import {  PlatoModule } from 'src/plato/plato.module';
import { MenuDiarioController } from './menudiario.controller';
import { SucursalModule } from 'src/sucursal/sucursal.module';
import { IngredientexplatoModule } from 'src/Ingredientexplato/ingredientexplato.module';
import { IngredientexplatoService } from 'src/Ingredientexplato/ingredientexplato.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: MENUDIARIO.name,
        useFactory: () => MenuDiarioSchema.plugin(require('mongoose-autopopulate')),
      },
    ]),
    PlatoModule,SucursalModule,IngredientexplatoModule,
  ],
  controllers: [MenuDiarioController],
  providers: [MenuDiarioService,IngredientexplatoService],
})
export class MenuDiarioModule {}

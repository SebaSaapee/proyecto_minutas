import {  MENUDIARIO } from '../common/models/models';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

import { MenuDiarioService } from './menudiario.service';
import {  MenuDiarioSchema } from './schema/menudiario.schema';
import {  PlatoModule } from 'src/plato/plato.module';
import { MenuDiarioController } from './menudiario.controller';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: MENUDIARIO.name,
        useFactory: () => MenuDiarioSchema.plugin(require('mongoose-autopopulate')),
      },
    ]),
    PlatoModule,
  ],
  controllers: [MenuDiarioController],
  providers: [MenuDiarioService],
})
export class MenuDiarioModule {}

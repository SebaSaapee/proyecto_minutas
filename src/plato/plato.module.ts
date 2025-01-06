import { Module } from '@nestjs/common';
import {  PLATO } from '../common/models/models';
import { MongooseModule } from '@nestjs/mongoose';
import {  PlatoController } from './plato.controller';
import {  PlatoService } from './plato.service';
import { PlatoSchema } from './schema/plato.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: PLATO.name,
        useFactory: () => PlatoSchema,
      },
    ]),
  ],
  controllers: [PlatoController],
  providers: [PlatoService],
  exports: [PlatoService],
})
export class PlatoModule {}

import { Module } from '@nestjs/common';
import { PROYECCION } from '../common/models/models';
import { MongooseModule } from '@nestjs/mongoose';
import { ProyeccionController } from './proyeccion.controller';
import { ProyeccionService } from './proyeccion.service';
import { ProyeccionSchema } from './schema/proyeccion.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: PROYECCION.name,
        useFactory: () => ProyeccionSchema,
      },
    ]),
  ],
  controllers: [ProyeccionController],
  providers: [ProyeccionService],
  exports: [ProyeccionService, MongooseModule],
})
export class ProyeccionModule {}

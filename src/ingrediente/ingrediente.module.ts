import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IngredienteController } from './ingrediente.controller';
import { IngredienteService } from './ingrediente.service';
import { IngredienteSchema } from './schema/ingrediente.schema';
import { INGREDIENTE } from 'src/common/models/models';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: INGREDIENTE.name,
        useFactory: () => IngredienteSchema,
      },
    ]),
  ],
  controllers: [IngredienteController],
  providers: [IngredienteService],
  exports: [IngredienteService],
})
export class IngredienteModule {}
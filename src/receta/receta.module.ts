import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecetaController } from './receta.controller';
import { RecetaService } from './receta.service';
import { RECETA } from 'src/common/models/models';
import { RecetaSchema } from './schema/receta.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: RECETA.name,
        useFactory: () => RecetaSchema,
      },
    ]),
  ],
  controllers: [RecetaController],
  providers: [RecetaService],
  exports: [RecetaService],
})
export class RecetaModule {}
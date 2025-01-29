import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EstructuraController } from './estructura.controller';

import { ESTRUCTURA } from 'src/common/models/models';
import { EstructuraSchema } from './schema/estructura.schema';
import { EstructuraService } from './estructura.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: ESTRUCTURA.name,
        useFactory: () => EstructuraSchema,
      },
    ]),
  ],
  controllers: [EstructuraController],
  providers: [EstructuraService],
  exports: [EstructuraService],
})
export class EstructuraModule {}

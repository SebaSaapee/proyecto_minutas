import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SucursalController } from './sucursal.controller';
import { SucursalService } from './sucursal.service';
import { SUCURSAL } from 'src/common/models/models';
import { SucursalSchema } from './schema/sucursal.schema';


@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: SUCURSAL.name,
        useFactory: () => SucursalSchema,
      },
    ]),
  ],
  controllers: [SucursalController],
  providers: [SucursalService],
  exports: [SucursalService],
})
export class SucursalModule {}
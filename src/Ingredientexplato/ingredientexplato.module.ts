import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IngredientexplatoService } from './ingredientexplato.service';
import { IngredientexplatoController } from './ingredientexplato.controller';
import { INGREDIENTEXPLATO } from 'src/common/models/models';
import { IngredientexplatoSchema } from './schema/ingredientexplato.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: INGREDIENTEXPLATO.name,
        useFactory: () => IngredientexplatoSchema, // Asegúrate de que este esquema esté bien configurado
      },
    ]),
  ],
  controllers: [IngredientexplatoController],
  providers: [IngredientexplatoService],
  exports: [MongooseModule, IngredientexplatoService], // Exporta el modelo y el servicio
})
export class IngredientexplatoModule {}
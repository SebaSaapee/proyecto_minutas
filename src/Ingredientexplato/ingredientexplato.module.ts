import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IngredientexplatoService } from './ingredientexplato.service';
import { IngredientexplatoController } from './ingredientexplato.controller';
import { INGREDIENTEXPLATO } from 'src/common/models/models';
import { IngredientexplatoSchema } from './schema/ingredientexplato.schema';
 // Asegúrate de tener el esquema correspondiente

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: INGREDIENTEXPLATO.name,
        useFactory: () => IngredientexplatoSchema,
      },
    ]),
  ],
  controllers: [IngredientexplatoController],
  providers: [IngredientexplatoService],
  exports: [IngredientexplatoService], // Si deseas exportar el servicio para que otros módulos puedan usarlo
})
export class IngredientexplatoModule {}
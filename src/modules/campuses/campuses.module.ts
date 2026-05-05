import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CampusesController } from './campuses.controller';
import { CampusesService } from './campuses.service';
import { Campus, CampusSchema } from '../../schemas/campus.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Campus.name, schema: CampusSchema }]),
  ],
  controllers: [CampusesController],
  providers: [CampusesService],
  exports: [CampusesService],
})
export class CampusesModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyDay } from './entities/study-day.entity';
import { StudyFilm } from './entities/study-film.entity';
import { StudyProgress } from './entities/study-progress.entity';
import { StudyUnit } from './entities/study-unit.entity';
import { StudyWord } from './entities/study-word.entity';
import { StudyController } from './study.controller';
import { StudyService } from './study.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudyUnit, StudyDay, StudyWord, StudyFilm, StudyProgress]),
  ],
  controllers: [StudyController],
  providers: [StudyService],
})
export class StudyModule {}

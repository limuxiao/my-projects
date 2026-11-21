import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyDay } from './entities/study-day.entity';
import { StudyFilm } from './entities/study-film.entity';
import { StudyProgress } from './entities/study-progress.entity';
import { StudyUnit } from './entities/study-unit.entity';
import { StudyWord } from './entities/study-word.entity';

export interface StudyWordView extends Omit<StudyWord, 'audio'> {
  hasAudio: boolean;
}

export interface DayDetail extends StudyDay {
  words: StudyWordView[];
}

export interface Overview {
  stats: { units: number; days: number; words: number; films: number; wordsPerDay: number };
  units: StudyUnit[];
}

@Injectable()
export class StudyService {
  constructor(
    @InjectRepository(StudyUnit) private readonly units: Repository<StudyUnit>,
    @InjectRepository(StudyDay) private readonly days: Repository<StudyDay>,
    @InjectRepository(StudyWord) private readonly words: Repository<StudyWord>,
    @InjectRepository(StudyFilm) private readonly films: Repository<StudyFilm>,
    @InjectRepository(StudyProgress) private readonly progress: Repository<StudyProgress>,
  ) {}

  async getOverview(): Promise<Overview> {
    const [units, days, words, films] = await Promise.all([
      this.units.find({ order: { id: 'ASC' } }),
      this.days.count(),
      this.words.count(),
      this.films.count(),
    ]);
    return {
      stats: { units: units.length, days, words, films, wordsPerDay: days ? words / days : 0 },
      units,
    };
  }

  getUnits(): Promise<StudyUnit[]> {
    return this.units.find({ order: { id: 'ASC' } });
  }

  async getDay(globalDay: number): Promise<DayDetail> {
    const day = await this.days.findOneBy({ globalDay });
    if (!day) throw new NotFoundException(`Day ${globalDay} not found`);
    const [words, audioRows] = await Promise.all([
      this.words.find({
        where: { dayId: day.id },
        order: { seq: 'ASC' },
        select: {
          id: true,
          dayId: true,
          seq: true,
          word: true,
          pos: true,
          meaning: true,
          exampleEn: true,
          exampleZh: true,
        },
      }),
      this.words
        .createQueryBuilder('word')
        .select('word.id', 'id')
        .where('word.dayId = :dayId', { dayId: day.id })
        .andWhere('word.audio IS NOT NULL')
        .getRawMany<{ id: number }>(),
    ]);
    const audioIds = new Set(audioRows.map((row) => Number(row.id)));
    return {
      ...day,
      words: words.map((word) => ({ ...word, hasAudio: audioIds.has(word.id) })),
    };
  }

  async getWordAudio(id: number): Promise<Buffer | null> {
    const word = await this.words.findOne({
      where: { id },
      select: { id: true, audio: true },
    });
    return word?.audio ?? null;
  }

  // 按主题或单词的中英文搜索，返回命中的学习日
  async search(q: string): Promise<StudyDay[]> {
    const keyword = `%${q}%`;
    const matchedDays = await this.days
      .createQueryBuilder('day')
      .leftJoin('study_words', 'word', 'word.dayId = day.id')
      .where('day.theme LIKE :q', { q: keyword })
      .orWhere('word.word LIKE :q', { q: keyword })
      .orWhere('word.meaning LIKE :q', { q: keyword })
      .orderBy('day.globalDay', 'ASC')
      .getMany();
    return matchedDays;
  }

  getFilms(): Promise<StudyFilm[]> {
    return this.films.find({ order: { sortOrder: 'ASC' } });
  }

  async getProgress(userId: number): Promise<{ completed: number[]; total: number }> {
    const rows = await this.progress.find({ where: { userId }, order: { globalDay: 'ASC' } });
    return { completed: rows.map((r) => r.globalDay), total: 200 };
  }

  // 幂等：已存在则直接返回，不重复插入
  async markDone(userId: number, globalDay: number): Promise<{ globalDay: number }> {
    const existing = await this.progress.findOneBy({ userId, globalDay });
    if (!existing) {
      await this.progress.insert({ userId, globalDay, createdAt: new Date() });
    }
    return { globalDay };
  }

  async unmarkDone(userId: number, globalDay: number): Promise<{ deleted: boolean }> {
    await this.progress.delete({ userId, globalDay });
    return { deleted: true };
  }
}

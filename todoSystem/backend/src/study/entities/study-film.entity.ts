import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('study_films')
export class StudyFilm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  cn: string;

  @Column()
  year: string;

  @Column()
  genre: string;

  @Column()
  level: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'text' })
  synopsis: string;

  @Column({ type: 'text' })
  tips: string;

  @Column({ type: 'text' })
  quote: string;

  @Column({ type: 'text' })
  quoteZh: string;

  @Column({ default: 0 })
  sortOrder: number;
}

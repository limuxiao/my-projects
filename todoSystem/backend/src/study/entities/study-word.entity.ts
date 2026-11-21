import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('study_words')
export class StudyWord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  dayId: number;

  @Column()
  seq: number;

  @Column()
  @Index()
  word: string;

  @Column()
  pos: string;

  @Column()
  meaning: string;

  @Column({ type: 'text' })
  exampleEn: string;

  @Column({ type: 'text' })
  exampleZh: string;

  @Column({ type: 'longblob', nullable: true })
  audio?: Buffer;
}

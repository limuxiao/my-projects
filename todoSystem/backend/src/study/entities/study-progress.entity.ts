import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('study_progress')
export class StudyProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  userId: number;

  @Column()
  globalDay: number;

  @Column({ type: 'datetime', precision: 6 })
  createdAt: Date;
}

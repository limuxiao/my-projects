import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('study_days')
export class StudyDay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  unitId: number;

  @Column()
  dayNo: number;

  @Column()
  @Index({ unique: true })
  globalDay: number;

  @Column()
  theme: string;
}

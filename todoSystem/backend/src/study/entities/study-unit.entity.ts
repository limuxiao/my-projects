import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('study_units')
export class StudyUnit {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  en: string;

  @Column({ type: 'text' })
  theme: string;

  @Column({ type: 'text' })
  intro: string;

  @Column({ type: 'text' })
  introZh: string;

  @Column({ type: 'text' })
  outro: string;

  @Column({ type: 'text' })
  outroZh: string;
}

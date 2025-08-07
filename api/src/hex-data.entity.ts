import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class HexData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  data: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

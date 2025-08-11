import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class HexData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  data: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'varchar', nullable: true })
  device_identifier: string;

  @Column({ type: 'varchar', nullable: true })
  data_type: string;

  @Column({ type: 'varchar', nullable: true })
  function_type: string;

  @Column({ type: 'varchar', nullable: true })
  number_of_bytes: string;

  @Column({ type: 'varchar', nullable: true })
  '1byte_1st_sensor': string;

  @Column({ type: 'varchar', nullable: true })
  '1byte_2nd_sensor': string;

  @Column({ type: 'varchar', nullable: true })
  '1byte_3rd_sensor': string;

  @Column({ type: 'varchar', nullable: true })
  '1byte_4th_sensor': string;

  @Column({ type: 'varchar', nullable: true })
  '2byte_crc': string;
}

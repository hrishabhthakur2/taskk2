import { User } from 'src/auth/auth.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true }) // Gantilah dengan path yang sesuai
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => User, { eager: true }) // Gantilah dengan path yang sesuai
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @Column()
  text: string;

  @Column({ nullable: true })
  file: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

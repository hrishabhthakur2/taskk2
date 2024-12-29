import { Message } from 'src/events/message.entity';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity('user')
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ nullable: false, unique: true })
  username: string;

  @Column({ nullable: false })
  password: string;

  @Field(() => [Message], { nullable: true })
  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @Field(() => [Message], { nullable: true })
  @OneToMany(() => Message, (message) => message.recipient)
  receivedMessages: Message[];
}
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfigAsync } from 'src/config/jwt.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfigAsync),
    TypeOrmModule.forFeature([Message]),
  ],
  providers: [EventsGateway],
})
export class EventsModule {}

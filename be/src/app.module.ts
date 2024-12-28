import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { Message } from './events/message.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfigAsync } from './config/jwt.config';
import { User } from './auth/auth.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    TypeOrmModule.forFeature([Message, User]),
    AuthModule,
    EventsModule,
    JwtModule.registerAsync(jwtConfigAsync),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

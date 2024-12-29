import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { JwtModule } from '@nestjs/jwt';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

// Modules
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';

// Entities
import { Message } from './events/message.entity';
import { User } from './auth/auth.entity';

// Configurations
import { typeOrmConfigAsync } from './config/typeorm.config';
import { jwtConfigAsync } from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
    }),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    TypeOrmModule.forFeature([Message, User]), // Add this line
    AuthModule,
    EventsModule,
    JwtModule.registerAsync(jwtConfigAsync),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';

export default class JwtConfig {
  static getJWTConfig(configService: ConfigService): JwtModuleOptions {
    return {
      secret: configService.get('JWT_SECRET'),
    };
  }
}

export const jwtConfigAsync: JwtModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (configservice: ConfigService): Promise<JwtModuleOptions> =>
    JwtConfig.getJWTConfig(configservice),
  inject: [ConfigService],
};

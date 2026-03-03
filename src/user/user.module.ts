import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccessTokenJwtStrategy } from './strategies/access-token-jwt.strategies';
import { RefreshTokenJwtStrategy } from './strategies/refresh-token-jwt.strategies';
import { DogOwnerGuard } from './guards/dog-owner.guard';

@Module({
  imports: [JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (
      configService: ConfigService,
    ): Promise<JwtModuleOptions> => {
      return {
        secret: configService.getOrThrow('ACCESS_TOKEN_PRIVATE_KEY'),
        signOptions: {
          expiresIn: '15m',
          algorithm: 'RS256',
        },
      };
    },
  }),
  JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (
      configService: ConfigService,
    ): Promise<JwtModuleOptions> => {
      return {
        secret: configService.getOrThrow('REFRESH_TOKEN_PRIVATE_KEY'),
        signOptions: {
          expiresIn: '7d',
          algorithm: 'RS256',
        },
      };
    },
  }),],
  controllers: [UserController],
  providers: [UserService, AccessTokenJwtStrategy, RefreshTokenJwtStrategy, DogOwnerGuard],
  exports: [UserService, DogOwnerGuard],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalAuthenticationStrategy } from './strategies/local-strategy';
import { AuthenticationController } from './authentication.controller';
import { JwtAuthenticationStrategy } from './strategies/jwt-strategy';


@Module({
  imports: [
            UsersModule,
            JwtModule.registerAsync({
              imports: [ConfigModule],
              inject: [ConfigService],
              useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '2m' },
              })
            })
  ],
  providers: [AuthenticationService,  
              LocalAuthenticationStrategy,
              JwtAuthenticationStrategy],
  controllers: [AuthenticationController]

})
export class AuthenticationModule {}

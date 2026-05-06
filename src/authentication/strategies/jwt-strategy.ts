import { Logger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";


@Injectable()
export class JwtAuthenticationStrategy extends PassportStrategy(Strategy, 'jwt') {
    private readonly logger: Logger;
  constructor(
                private configService: ConfigService,
  ) {

    const jwtSecret = configService.get<string>('JWT_SECRET');
    
    if (!jwtSecret) 
      throw new Error('${JwtAuthenticationStrategy.name} : JWT_SECRET is not defined in the configuration.');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });

    this.logger = new Logger(JwtAuthenticationStrategy.name);
  }

  async validate(playload: any) {

    this.logger.log(`Validating JWT token for user ${playload.sub.userName}.`);

    return {
      id: playload.id,
      username: playload.sub.userName,
    };
  }
  
}
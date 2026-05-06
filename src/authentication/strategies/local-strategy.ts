import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthenticationService } from "../authentication.service";
import { Logger, Injectable, UnauthorizedException } from "@nestjs/common";



@Injectable()
export class LocalAuthenticationStrategy extends PassportStrategy(Strategy) {

    private readonly logger: Logger;

    constructor(private readonly authenticationService: AuthenticationService,
    ) {
        super();

        this.logger = new Logger(LocalAuthenticationStrategy.name);
    }

    async validate(username: string,password: string) {

        this.logger.log(`Attempting to validate user ${username} with local strategy.`);
        
        const user = await this.authenticationService.validateUser(username, password);
        
        if(user === null)
            throw new UnauthorizedException();

        this.logger.log(`User ${user.email} validated successfully.`);

        return user;
    }
}
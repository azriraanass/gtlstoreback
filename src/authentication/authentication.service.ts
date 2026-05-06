import {Logger, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthenticationService {

    private readonly logger: Logger;

    constructor(
        private readonly userService: UsersService, 
        private readonly jwtService: JwtService, 
    ){
        this.logger = new Logger(AuthenticationService.name);
    }

    async validateUser(userName: string, password: string) : Promise<any | null> {

        this.logger.log(`Validating user with username: ${userName}`);
        
        const user = await this.userService.findOne(userName);

        if(user != null && await bcrypt.compare(password, user.password)) {

            this.logger.log(`User found: ${user.username}`);

            const { password, ...result } = user;

            return result;
        }
        
        this.logger.log('User not found or invalid password for username: ${userName}');
        return null;
    }

    async login(user: User) {

        this.logger.log(`Generating JWT token for user ${user.email}.`);

        const playload = {
            id: user.id,
            sub: {
                userName: user.username,
            },
        };

        return {
            access_token: this.jwtService.sign(playload),
        };
    }
}

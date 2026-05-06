import { Controller, Request, UseGuards, Post, Body, Inject, Logger } from '@nestjs/common';
import { LocalAuthenticationGuard } from './guards/local-authentication.guard';
import { AuthenticationService } from './authentication.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';



@Controller('authentication')
export class AuthenticationController {

    private readonly logger: Logger;

    constructor(private readonly authenticationService: AuthenticationService,
                private readonly usersService: UsersService,
                private readonly configService: ConfigService,
    ) {
        
        this.logger = new Logger(AuthenticationController.name);
    }

    @UseGuards(LocalAuthenticationGuard)
    @Post('login')
    async logIn(@Request() request) {

        this.logger.log(`User ${request.user.username} logged in successfully.`);

        return this.authenticationService.login(request.user);
    }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {

        this.logger.log(`User registered: ${createUserDto.username}`);

        const saltRounds = this.configService.get<number>('SALT_ROUNDS') || 10;

        createUserDto.password = await bcrypt.hash(createUserDto.password, +saltRounds);

        const {password, ...responseUser}  = await this.usersService.create(createUserDto);
        
        return {
            user: responseUser,
            message: 'User registered successfully'
        };
    }
}

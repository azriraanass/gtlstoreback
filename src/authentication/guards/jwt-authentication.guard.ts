import { Injectable } from '@nestjs/common';
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAutenticationGuard extends AuthGuard('jwt') {
}
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy,ExtractJwt } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { IUser } from "src/user/interfaces/user.interface";



@Injectable()
export class AccessTokenJwtStrategy extends PassportStrategy(   Strategy, 'access-token-jwt') {
    constructor(
        private readonly configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            algorithms: ['RS256'],
            secretOrKey: configService.getOrThrow('ACCESS_TOKEN_PUBLIC_KEY'),
        });
    }

    async validate(payload: IUser): Promise<IUser> {
        return payload;
    }
}
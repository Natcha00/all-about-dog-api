import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy,ExtractJwt } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { IUser } from "../interfaces/user.interface";


@Injectable()
export class RefreshTokenJwtStrategy extends PassportStrategy(   Strategy, 'refresh-token-jwt') {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            algorithms: ['RS256'],
            secretOrKey: configService.getOrThrow('REFRESH_TOKEN_PUBLIC_KEY'),
        });
    }

    async validate(payload: IUser): Promise<IUser> {
      

        return payload;
    }
}
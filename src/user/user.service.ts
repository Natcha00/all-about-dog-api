import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {JwtService} from "@nestjs/jwt";
import { IToken } from "./interfaces/token.interface";
import { IUser } from "./interfaces/user.interface";

@Injectable()
export class UserService {
    constructor(
        private readonly configService: ConfigService,
         private readonly jwtService: JwtService
        ) {}

    async signAccessToken(tokenPayload: IUser): Promise<string> {
       return this.jwtService.sign(tokenPayload, { 
            expiresIn: '15m',
            secret : this.configService.getOrThrow('ACCESS_TOKEN_PRIVATE_KEY'),
            algorithm: 'RS256',
        });
    }

    async signRefreshToken(tokenPayload: IUser): Promise<string> {
        return this.jwtService.sign(tokenPayload, { 
            expiresIn: '7d',
            secret : this.configService.getOrThrow('REFRESH_TOKEN_PRIVATE_KEY'),
            algorithm: 'RS256',
        });
    }
    
    async refreshToken(refreshToken: string): Promise<IToken> {
        const tokenPayload = await this.jwtService.verify(refreshToken, {
            secret : this.configService.getOrThrow('REFRESH_TOKEN_PUBLIC_KEY'),
            algorithms: ['RS256'],
        });
        if (!tokenPayload) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        return {
            accessToken: await this.signAccessToken(tokenPayload),
            refreshToken: await this.signRefreshToken(tokenPayload),
        };
    }
}
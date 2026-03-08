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
            expiresIn: '10s',
            secret : this.configService.getOrThrow('ACCESS_TOKEN_PRIVATE_KEY'),
            algorithm: 'RS256',
        });
    }

    async signRefreshToken(tokenPayload: IUser): Promise<string> {
        return this.jwtService.sign(tokenPayload, { 
            expiresIn: '30d',
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
        const payload: IUser = { id: tokenPayload.id, role: tokenPayload.role };
        return {
            accessToken: await this.signAccessToken(payload),
            refreshToken: await this.signRefreshToken(payload),
        };
    }

    async verifyRefreshToken(refreshToken: string): Promise<IUser> {
        const payload = await this.jwtService.verify(refreshToken, {
            secret: this.configService.getOrThrow('REFRESH_TOKEN_PUBLIC_KEY'),
            algorithms: ['RS256'],
        });
        if (!payload) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        return payload as IUser;
    }
}
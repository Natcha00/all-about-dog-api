import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ROLE } from 'src/user/enums/role.enum';
import { IToken } from 'src/user/interfaces/token.interface';

@Injectable()
export class RefreshTokenUsecase {
  constructor(private readonly userService: UserService) {}

  async execute(refreshToken: string): Promise<IToken> {
    const payload = await this.userService.verifyRefreshToken(refreshToken);
    if (payload.role !== ROLE.STAFF && payload.role !== ROLE.ADMIN) {
      throw new UnauthorizedException('Invalid refresh token for staff or admin');
    }
    return this.userService.refreshToken(refreshToken);
  }
}

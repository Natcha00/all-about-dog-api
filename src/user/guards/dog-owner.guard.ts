import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ROLE } from '../enums/role.enum';

@Injectable()
export class DogOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || user.role !== ROLE.DOG_OWNER) {
      throw new ForbiddenException('Dog owner only');
    }
    return true;
  }
}

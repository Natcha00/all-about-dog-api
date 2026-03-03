import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from 'src/user/interfaces/user.interface';

export const StaffDecorator = createParamDecorator<IUser>(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

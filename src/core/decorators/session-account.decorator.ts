import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type PayloadUser = {
  id: number;
  email: string;
  type: 'access' | 'refresh';
};

export const SessionAccount = createParamDecorator(
  (key: keyof PayloadUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const requestAccount = request.user as PayloadUser;
    return key ? requestAccount[key] : requestAccount;
  },
);

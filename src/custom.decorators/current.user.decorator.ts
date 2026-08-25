import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface CurrentUserPayload {
  userId: string;
  roles: string[];
  shopId?: string;
}

type AuthenticatedRequest = Request & {
  user?: CurrentUserPayload;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload | null => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user ?? null;
  },
);

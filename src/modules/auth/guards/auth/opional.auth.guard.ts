// // optional-jwt-auth.guard.ts

// import { ExecutionContext, Injectable } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';

// @Injectable()
// export class OptionalAuthGuard extends AuthGuard('jwt') {
//   handleRequest(err: any, user: any) {
//     if (err) {
//       return null;
//     }

//     return user ?? null;
//   }

//   canActivate(context: ExecutionContext) {
//     const request = context.switchToHttp().getRequest();

//     const authorization = request.headers.authorization;

//     if (!authorization) {
//       request.user = null;
//       return true;
//     }

//     return super.canActivate(context);
//   }
// }

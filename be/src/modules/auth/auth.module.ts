import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth/auth.guard';
import { APP_GUARD } from '@nestjs/core/constants';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30s' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,  
  {
    provide: APP_GUARD,
    useClass: AuthGuard,
  },
],
  exports: [AuthService],
})
export class AuthModule {}

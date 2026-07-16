import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/services/users.service';
import { UserPhotosService } from '../users/services/user.photos.services';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // async login(loginDto: LoginDto): Promise<{ access_token: string }> {
  //   const user = await this.usersRepository.findByEmail(loginDto.email);

  //   if (!user) {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }

  //   const matchedPassword = await bcrypt.compare(
  //     loginDto.password,
  //     user.password_hashed,
  //   );

  //   if (!matchedPassword) {
  //     throw new UnauthorizedException('Wrong Password!');
  //   }

  //   const payload = {
  //     sub: { id: user.id, role: user.role },
  //   };
  //   return {
  //     access_token: this.jwtService.sign(payload),
  //   };
  // }
}

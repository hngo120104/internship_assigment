import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../users/repositories/users.repository';
import { UserCreateRequestDto } from '../users/dto/user-create-request.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async register(registerRequestDto: UserCreateRequestDto): Promise<{ access_token: string } | null> {
    const emailExist = await this.usersRepository.checkEmailExist(registerRequestDto.email);

    if (emailExist) {
      return null;
    }

    const hashedPassword = await bcrypt.hash(registerRequestDto.password, 10);
    const user = await this.usersRepository.createUser({
      ...registerRequestDto,
      password: hashedPassword,
    });

    const payload = {
      sub: { id: user.id, role: user.role },
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

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

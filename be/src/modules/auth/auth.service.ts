import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/services/users.service';
import { LoginRequestDto } from './dto/login.request.dto';
import * as bcrypt from 'bcrypt';
import { UserCreateRequestDto } from '../users/dto/user.create.request.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(
    userCreateRequestDto: UserCreateRequestDto,
  ): Promise<{ access_token: string }> {
    const newUser =
      await this.usersService.createUserWithPhotos(userCreateRequestDto);
    const payload = {
      sub: newUser.id,
      role: newUser.role,
    };
    return { access_token: this.jwtService.sign(payload) };
  }

  async login(
    loginRequestDto: LoginRequestDto,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findByEmail(loginRequestDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matchedPassword = await bcrypt.compare(
      loginRequestDto.password,
      user.passwordHashed,
    );

    if (!matchedPassword) {
      throw new UnauthorizedException('Wrong Password!');
    }

    const payload = {
       sub: user.id, role: user.role 
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

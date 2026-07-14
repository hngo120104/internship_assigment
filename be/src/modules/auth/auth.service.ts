import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.userService.findByEmail(registerDto.email);

    if (user) {
      throw new Error('Email already exists');
    }
    
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = await this.userService.create({ ...registerDto, password: hashedPassword });

    if (newUser) {
      return("User registered successfully");
    }
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matchedPassword = await bcrypt.compare(loginDto.password, user.password_hashed);

    if (!matchedPassword) {
      throw new UnauthorizedException('Wrong Password!');
    }

    const payload = { sub: { id: user.id, email: user.email, role: user.role } };
    return {
      access_token: this.jwtService.sign(payload)
      
    };
  }
}

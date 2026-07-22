import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/services/users.service';
import { LoginRequestDto } from './dto/login.request.dto';
import * as bcrypt from 'bcrypt';
import { UserCreateRequestDto } from '../users/dto/user.create.request.dto';
import { UserShopCreateRequestDto } from '../users/dto/user.shop.create.request.dto';
import { UserShopService } from '../users/services/user.shop.service';
import { Role } from './guards/role/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly userShopService: UserShopService,
    private readonly jwtService: JwtService,
  ) {}

  async userRegister(
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

  async shopRegister(
    userId: number,
    userShopCreateRequestDto: UserShopCreateRequestDto,
  ): Promise<{ access_token: string }> {
    const userExist = await this.usersService.findById(userId);
    if (!userExist) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const newShop = await this.userShopService.createShop(
      userId,
      userShopCreateRequestDto,
    );

    const payload = {
      sub: newShop.id,
      role: Role.SHOP,
    };
    return { access_token: this.jwtService.sign(payload) };
  }

  async login(
    loginRequestDto: LoginRequestDto,
  ): Promise<{ access_token: string }> {
    const userExist = await this.usersService.findByEmail(
      loginRequestDto.email,
    );
    if (!userExist) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matchedPassword = await bcrypt.compare(
      loginRequestDto.password,
      userExist.passwordHashed,
    );

    if (!matchedPassword) {
      throw new UnauthorizedException('Wrong Password!');
    }

    const payload = {
      sub: userExist.id,
      role: userExist.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

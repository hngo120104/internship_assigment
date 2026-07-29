import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import { LoginRequestDto } from '../dto/login.request.dto';
import * as bcrypt from 'bcrypt';
import { LoginResponseDto } from '../dto/login.response.dto';
import { User } from '../../users/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { UserCreateRequestDto } from '../../users/dto/users/user.create.request.dto';
import { UserCreateResponseDto } from '../../users/dto/users/user.create.response.dto';
import { UserShopCreateRequestDto } from '../../users/dto/user.shop/user.shop.create.request.dto';
import { UserShopCreateResponseDto } from '../../users/dto/user.shop/user.shop.create.response.dto';
import { Role } from '../../users/entities/role.entity';
import { RoleResponseDto } from '../../users/dto/role/role.response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async validateLoginUser(
    loginRequestDto: LoginRequestDto,
  ): Promise<User> {
    const userExist = await this.usersService.findActiveUserByEmail(
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
      throw new UnauthorizedException('Invalid credentials!');
    }

    return userExist;
  }

  async signAccessToken(userId: string, roles: RoleResponseDto[]): Promise<string> {
    return this.jwtService.sign({
      sub: userId,
      roles: roles.map((role) => role.name),
    });
  }

  async registerUser(
    userCreateRequestDto: UserCreateRequestDto,
  ): Promise<UserCreateResponseDto> {
    const createdUserResponse =
      await this.usersService.createDefaultUser(userCreateRequestDto);
    const accessToken = await this.signAccessToken(
      createdUserResponse.id,
      createdUserResponse.roles,
    );

    return plainToInstance(
      UserCreateResponseDto,
      {
        ...createdUserResponse,
        access_token: accessToken,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async registerShop(
    userId: string,
    userShopCreateRequestDto: UserShopCreateRequestDto,
  ): Promise<UserShopCreateResponseDto> {
    const shopRegisterResponse = await this.usersService.shopRegister(
      userId,
      userShopCreateRequestDto,
    );
    const accessToken = await this.signAccessToken(
      shopRegisterResponse.user.id,
      shopRegisterResponse.user.roles,
    );

    return plainToInstance(UserShopCreateResponseDto, {
      ...shopRegisterResponse,
      access_token: accessToken,
    });
  }

  async login(loginRequestDto: LoginRequestDto): Promise<LoginResponseDto> {
    const validatedUser = await this.validateLoginUser(loginRequestDto);
    const validatedUserAccessToken = await this.signAccessToken(
      validatedUser.id,
      validatedUser.roles
    );
    return plainToInstance(
      LoginResponseDto,
      {
        ...validatedUser,
        access_token: validatedUserAccessToken,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}

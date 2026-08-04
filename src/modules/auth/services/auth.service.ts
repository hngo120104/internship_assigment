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
    const userWithEmailExist = await this.usersService.findActiveUserByEmail(
      loginRequestDto.email,
    );

    if (!userWithEmailExist) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matchedPassword = await bcrypt.compare(
      loginRequestDto.password,
      userWithEmailExist.passwordHashed,
    );

    if (!matchedPassword) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    return userWithEmailExist;
  }

  signAccessToken(userId: string, roles: RoleResponseDto[]): string {
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
    const accessToken = this.signAccessToken(
      createdUserResponse.id,
      createdUserResponse.roles,
    );
    return {
      ...createdUserResponse,
      access_token: accessToken,
    };
  }

  async registerShop(
    userId: string,
    userShopCreateRequestDto: UserShopCreateRequestDto,
  ): Promise<UserShopCreateResponseDto> {
    const shopRegisterResponse = await this.usersService.shopRegister(
      userId,
      userShopCreateRequestDto,
    );
    const accessToken = this.signAccessToken(
      shopRegisterResponse.user.id,
      shopRegisterResponse.user.roles,
    );

    return {
      ...shopRegisterResponse,
      access_token: accessToken,
    };
  }

  async login(loginRequestDto: LoginRequestDto): Promise<LoginResponseDto> {
    const validatedUser = await this.validateLoginUser(loginRequestDto);
    const validatedUserAccessToken = this.signAccessToken(
      validatedUser.id,
      validatedUser.userRoles.map((userRoles) => userRoles.role),
    );
    const loginResponse = this.toLoginResponseDto(validatedUser);
    loginResponse.access_token = validatedUserAccessToken;
    return loginResponse;
  }

  private toLoginResponseDto(user: User): LoginResponseDto {
    return plainToInstance(LoginResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}

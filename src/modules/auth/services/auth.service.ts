import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import { LoginRequestDto } from '../dto/request/login.request.dto';
import * as bcrypt from 'bcrypt';
import { LoginResponseDto } from '../dto/response/login.response.dto';
import { User } from '../../users/entities/user.entity';
import { UserCreateRequestDto } from '../../users/dto/users/request/user-create.request.dto';
import { UserCreateResponseDto } from '../../users/dto/users/response/user-create.response.dto';
import { toResponseDto } from '../../../utils/response-dto.mapper';
import { RoleType } from '../../users/entities/role.entity';
import { UserResponseDto } from '../../users/dto/users/response/user.response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async validateLoginUser(loginDto: LoginRequestDto): Promise<User> {
    const userWithEmailExist =
      await this.usersService.findActiveUserByEmailOrThrow(loginDto.email);

    if (!userWithEmailExist) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matchedPassword = await bcrypt.compare(
      loginDto.password,
      userWithEmailExist.passwordHashed,
    );

    if (!matchedPassword) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    return userWithEmailExist;
  }

  private signAccessToken(
    userId: string,
    roles: RoleType[],
    shopId?: string,
  ): string {
    return this.jwtService.sign({
      userId: userId,
      roles: roles.map((role) => role),
      shopId: shopId,
    });
  }

  async registerUser(
    userCreateDto: UserCreateRequestDto,
  ): Promise<UserCreateResponseDto> {
    const createdUser =
      await this.usersService.createDefaultUser(userCreateDto);
    const accessToken = this.signAccessToken(
      createdUser.id,
      createdUser.userRoles.map((ur) => ur.role.roleType),
    );
    const registrationResponse = toResponseDto(
      UserCreateResponseDto,
      createdUser,
    );
    registrationResponse.accessToken = accessToken;
    return registrationResponse;
  }

  async login(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const validatedUser = await this.validateLoginUser(loginDto);
    const validatedUserAccessToken = this.signAccessToken(
      validatedUser.id,
      validatedUser.userRoles.map((userRoles) => userRoles.role.roleType),
      validatedUser.shop?.id,
    );
    const loginResponse: LoginResponseDto = {
      user: toResponseDto(UserResponseDto, validatedUser),
      accessToken: validatedUserAccessToken,
    };
    return loginResponse;
  }
}

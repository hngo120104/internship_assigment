import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import { LoginDto } from '../dto/login.dto';
import * as bcrypt from 'bcrypt';
import { LoginResponseDto } from '../dto/login.response.dto';
import { User } from '../../users/entities/user.entity';
import { UserCreateDto } from '../../users/dto/users/user.create.dto';
import { UserCreateResponseDto } from '../../users/dto/users/user.create.response.dto';
import { RoleResponseDto } from '../../users/dto/role/role.response.dto';
import { toResponseDto } from '../../../utils/to.dto.response';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async validateLoginUser(loginDto: LoginDto): Promise<User> {
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

  signAccessToken(userId: string, roles: RoleResponseDto[]): string {
    return this.jwtService.sign({
      sub: userId,
      roles: roles.map((role) => role.name),
    });
  }

  async registerUser(
    userCreateDto: UserCreateDto,
  ): Promise<UserCreateResponseDto> {
    const createdUserResponse =
      await this.usersService.createDefaultUser(userCreateDto);
    const accessToken = this.signAccessToken(
      createdUserResponse.id,
      createdUserResponse.roles,
    );
    createdUserResponse.access_token = accessToken;
    return createdUserResponse;
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const validatedUser = await this.validateLoginUser(loginDto);
    const validatedUserAccessToken = this.signAccessToken(
      validatedUser.id,
      validatedUser.userRoles.map((userRoles) => userRoles.role),
    );
    const loginResponse = toResponseDto(LoginResponseDto, validatedUser);
    loginResponse.access_token = validatedUserAccessToken;
    return loginResponse;
  }
}

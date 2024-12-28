import { PickType } from '@nestjs/mapped-types';
import { IsInt, IsString, MinLength } from 'class-validator';

export class UserDto {
  @IsInt()
  id: number;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class RegisterDto extends PickType(UserDto, ['username', 'password']) {}
export class LoginDto extends PickType(UserDto, ['username', 'password']) {}

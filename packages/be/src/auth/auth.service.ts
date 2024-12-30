import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './auth.entity';
import { LoginDto, RegisterDto } from './auth.dto';
import { ResponseSuccess } from 'src/interfaces/response';
import { compare, hash } from 'bcrypt';
import BaseResponse from 'src/utils/response/base.response';
import { JwtService } from '@nestjs/jwt';
import { jwtPayload } from './auth.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService extends BaseResponse {
  constructor(
    @InjectRepository(User) private readonly authRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  // Method to find user by ID
  async findById(id: number): Promise<User> {
    const user = await this.authRepo.findOne({
      where: { id },
      relations: ['sentMessages', 'receivedMessages'],
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  // Method to retrieve all users
  async findAll(): Promise<User[]> {
    return this.authRepo.find({
      relations: ['sentMessages', 'receivedMessages'],
    });
  }

  // User registration method
  async register(payload: RegisterDto, clbk: (token: string) => void): Promise<ResponseSuccess> {
    const userExists = await this.authRepo.findOne({
      where: { username: payload.username },
    });

    if (userExists) {
      throw new HttpException('Username already in use', HttpStatus.CONFLICT);
    }

    payload.password = await hash(payload.password, 12);

    const newUser = await this.authRepo.save(payload);
    const jwtPayload: jwtPayload = {
      id: newUser.id,
      username: newUser.username,
    };

    const token = this.generateJWT(
      jwtPayload,
      '1d',
      this.configService.get<string>('JWT_SECRET'),
    );

    clbk(token);
    return this._success('Registration successful', jwtPayload);
  }

  // User login method
  async login(payload: LoginDto, clbk: (token: string) => void): Promise<ResponseSuccess> {
    const user = await this.authRepo.findOne({
      where: { username: payload.username },
      select: ['id', 'username', 'password'],
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const isPasswordValid = await compare(payload.password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid username or password', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const jwtPayload: jwtPayload = {
      id: user.id,
      username: user.username,
    };

    const token = this.generateJWT(
      jwtPayload,
      '1d',
      this.configService.get<string>('JWT_SECRET'),
    );

    clbk(token);
    return this._success('Login successful', user);
  }

  // Method to retrieve user profile based on JWT
  async profile(token: string): Promise<ResponseSuccess> {
    try {
      const user = this.jwtService.verify<jwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return this._success('Token verified successfully', user);
    } catch (error) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }

  // Utility method to generate JWT
  private generateJWT(payload: jwtPayload, expiresIn: string | number, secret: string): string {
    return this.jwtService.sign(payload, { secret, expiresIn });
  }
}

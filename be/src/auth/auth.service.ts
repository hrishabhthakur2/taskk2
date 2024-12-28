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
// import { jwt_config } from 'src/config/jwt.config';

@Injectable()
export class AuthService extends BaseResponse {
  constructor(
    @InjectRepository(User) private authRepo: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    super();
  }

  async register(payload: RegisterDto, clbk: any): Promise<ResponseSuccess> {
    const checkUserExists = await this.authRepo.findOne({
      where: {
        username: payload.username,
      },
    });

    if (checkUserExists) {
      throw new HttpException('Username sudah digunakan', HttpStatus.FOUND);
    }

    payload.password = await hash(payload.password, 12); //hash password

    const userCreated = await this.authRepo.save(payload);
    const jwtPayload: jwtPayload = {
      id: userCreated.id,
      username: userCreated.username,
    };

    const token = this.generateJWT(
      jwtPayload,
      '1d',
      this.configService.get('JWT_SECRET'),
    );
    clbk(token);

    return this._success('Register Berhasil', jwtPayload);
  }

  async login(payload: LoginDto, clbk: any): Promise<ResponseSuccess> {
    const checkUserExists = await this.authRepo.findOne({
      where: {
        username: payload.username,
      },
      select: {
        id: true,
        username: true,
        password: true,
      },
    });

    if (!checkUserExists) {
      throw new HttpException(
        'User tidak ditemukan',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const checkPassword = await compare(
      payload.password,
      checkUserExists.password,
    ); // compare password yang dikirim dengan password yang ada di tabel

    if (checkPassword) {
      const jwtPayload: jwtPayload = {
        id: checkUserExists.id,
        username: checkUserExists.username,
      };

      const token = this.generateJWT(
        jwtPayload,
        '1d',
        this.configService.get('JWT_SECRET'),
      );
      clbk(token);

      return this._success('Login Success', checkUserExists);
    } else {
      throw new HttpException(
        'username dan password tidak sama',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async profile(token: string) {
    try {
      const user = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      return this._success('Berhasil Verify', user);
    } catch (error) {
      return {
        status: 'error',
      };
    }
  }

  generateJWT(payload: jwtPayload, expiresIn: string | number, token: string) {
    return this.jwtService.sign(payload, {
      secret: token,
      expiresIn: expiresIn,
    });
  }
}

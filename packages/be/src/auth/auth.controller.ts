import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() payload: RegisterDto,
    @Res({ passthrough: true }) res,
  ) {
    return this.authService.register(payload, (val) => {
      res.cookie('token', val, { sameSite: 'none', secure: true });
    });
  }

  @Post('login')
  login(@Body() payload: LoginDto, @Res({ passthrough: true }) res) {
    return this.authService.login(payload, (val) => {
      res.cookie('token', val, { sameSite: 'none', secure: true });
    });
  }

  @Get('/profile')
  getProfile(@Req() request) {
    const token = request.cookies?.token;
    return this.authService.profile(token);
  }

  @Post('/logout')
  logout(@Res({ passthrough: true }) res) {
    console.log('logout');
    res.cookie('token', '', { sameSite: 'none', secure: true }).json('ok');
  }
}

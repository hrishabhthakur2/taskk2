import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/messages/:userId')
  message(@Param('userId') id: string, @Req() request) {
    const token = request.cookies?.token;
    return this.appService.getMessage(Number(id), token);
  }

  @Get('/people')
  getPeople() {
    return this.appService.getPeople();
  }

  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'public/uploads',
        filename: (req, file, cb) => {
          console.log(file);
          const fileExtension = file.originalname.split('.').pop();
          cb(null, `${new Date().getTime()}.${fileExtension}`);
        },
      }),
    }),
  )
  @Post('upload/file')
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<any> {
    console.log(file);
    try {
      const url = `http://localhost:5003/uploads/${file.filename}`;
      return {
        file_url: url,
        file_name: file.filename,
        file_size: file.size,
      };
    } catch (err) {
      console.log(err);
      throw new HttpException('Ada Kesalahan', HttpStatus.BAD_REQUEST);
    }
  }
}

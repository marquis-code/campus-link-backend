import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { memoryStorage } from 'multer';

const multerOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
};

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadSingle(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFile(file, 'campuslink/products');
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 5, multerOptions))
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadService.uploadMultiple(files, 'campuslink/products');
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFile(file, 'campuslink/avatars');
  }
}

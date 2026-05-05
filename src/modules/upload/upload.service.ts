import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'campuslink',
  ): Promise<{ url: string; publicId: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          transformation: [
            { width: 800, height: 800, crop: 'limit', quality: 'auto' },
          ],
        },
        (error, result: UploadApiResponse) => {
          if (error) {
            reject(new BadRequestException('Upload failed: ' + error.message));
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        },
      );

      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);
      stream.pipe(uploadStream);
    });
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    folder: string = 'campuslink',
  ): Promise<{ url: string; publicId: string }[]> {
    const uploads = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploads);
  }

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}

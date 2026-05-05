import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private configService;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, folder?: string): Promise<{
        url: string;
        publicId: string;
    }>;
    uploadMultiple(files: Express.Multer.File[], folder?: string): Promise<{
        url: string;
        publicId: string;
    }[]>;
    deleteFile(publicId: string): Promise<void>;
}

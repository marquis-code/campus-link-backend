import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    const validObjectId = Types.ObjectId.isValid(value);

    if (!validObjectId) {
      throw new BadRequestException(`Invalid ObjectId: ${value}`);
    }

    // Additional check: mongoose.Types.ObjectId.isValid sometimes returns true for 12 character strings
    // A strict check ensures it's a 24-character hex string
    if (!/^[0-9a-fA-F]{24}$/.test(value)) {
      throw new BadRequestException(`Invalid ObjectId format: ${value}`);
    }

    return value;
  }
}

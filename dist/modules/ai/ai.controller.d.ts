import { AiService } from './ai.service';
import { GenerateCopyDto } from './dto/ai.dto';
export declare class AiController {
    private aiService;
    constructor(aiService: AiService);
    generateCopy(dto: GenerateCopyDto): {
        whatsappCaption: string;
        marketingText: string;
        shortCaption: string;
    };
}

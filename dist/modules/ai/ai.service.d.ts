import { GenerateCopyDto } from './dto/ai.dto';
export declare class AiService {
    generateCopy(dto: GenerateCopyDto): {
        whatsappCaption: string;
        marketingText: string;
        shortCaption: string;
    };
    private getTemplates;
    private getCategoryEmojis;
    private random;
    private buildWhatsappCaption;
    private buildMarketingText;
    private buildShortCaption;
}

import { Injectable } from '@nestjs/common';
import { GenerateCopyDto } from './dto/ai.dto';

@Injectable()
export class AiService {
  // Template-based AI copy generation (no OpenAI API required)
  generateCopy(dto: GenerateCopyDto): {
    whatsappCaption: string;
    marketingText: string;
    shortCaption: string;
  } {
    const { productName, price, description, category, tone = 'casual' } = dto;
    const formattedPrice = `₦${price.toLocaleString()}`;

    const templates = this.getTemplates(tone);
    const emojis = this.getCategoryEmojis(category);

    // Generate WhatsApp caption
    const whatsappCaption = this.buildWhatsappCaption(
      productName,
      formattedPrice,
      description,
      emojis,
      templates,
    );

    // Generate marketing text
    const marketingText = this.buildMarketingText(
      productName,
      formattedPrice,
      description,
      emojis,
      templates,
    );

    // Generate short caption
    const shortCaption = this.buildShortCaption(
      productName,
      formattedPrice,
      emojis,
    );

    return { whatsappCaption, marketingText, shortCaption };
  }

  private getTemplates(tone: string) {
    const toneMap: Record<string, any> = {
      casual: {
        hooks: [
          '🔥 You need to see this!',
          '💯 Check this out fam!',
          '⚡ Don\'t sleep on this!',
          '🙌 This is what you\'ve been waiting for!',
          '👀 Look what I found!',
        ],
        ctas: [
          'Order now before it runs out! 👇',
          'DM to order now! 🛒',
          'Grab yours today! 💨',
          'Don\'t miss out, order now! 🔥',
          'Tap the link to order! 👇',
        ],
        urgency: [
          'Limited stock available!',
          'Going fast! ⏰',
          'Few pieces left!',
          'Selling out quick!',
          'Don\'t wait too long!',
        ],
      },
      professional: {
        hooks: [
          '✨ Introducing something special',
          '🎯 Quality meets affordability',
          '💎 Premium quality guaranteed',
          '🏆 Top-rated product alert',
          '📢 New arrival alert',
        ],
        ctas: [
          'Place your order today.',
          'Contact us to purchase.',
          'Order via the link below.',
          'Secure yours now.',
          'Click to order.',
        ],
        urgency: [
          'While supplies last.',
          'Limited availability.',
          'Exclusive offer.',
          'Available for a limited time.',
          'Stock is limited.',
        ],
      },
      urgent: {
        hooks: [
          '🚨 FLASH SALE ALERT!',
          '⏰ LAST CHANCE!',
          '🔴 ENDING SOON!',
          '💥 MASSIVE DEAL!',
          '🏃 HURRY!!!',
        ],
        ctas: [
          'ORDER RIGHT NOW! 🏃‍♂️',
          'BUY BEFORE IT\'S GONE!!! 😱',
          'GRAB IT NOW! ⚡',
          'DON\'T WAIT — ORDER NOW!',
          'CLICK TO BUY ASAP! 👇',
        ],
        urgency: [
          'ONLY A FEW LEFT!!!',
          'SELLING OUT IN HOURS!',
          'ALMOST GONE!',
          'THIS WON\'T LAST!',
          'FINAL PIECES!',
        ],
      },
    };

    return toneMap[tone] || toneMap.casual;
  }

  private getCategoryEmojis(category?: string): string {
    const emojiMap: Record<string, string> = {
      food: '🍔🍕🍗',
      perfume: '🧴✨💐',
      services: '🛠️💼📋',
      fashion: '👗👟🎒',
      electronics: '📱💻🎧',
      beauty: '💄💅✨',
      books: '📚📖🎓',
      health: '💪🏃‍♂️🥗',
      accessories: '⌚👜💍',
    };
    return emojiMap[category?.toLowerCase() || ''] || '🔥✨💯';
  }

  private random<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private buildWhatsappCaption(
    name: string,
    price: string,
    desc: string,
    emojis: string,
    templates: any,
  ): string {
    const hook = this.random(templates.hooks);
    const cta = this.random(templates.ctas);
    const urgency = this.random(templates.urgency);

    return `${hook}

${emojis} *${name}*
💰 Price: *${price}*

${desc}

${urgency}

${cta}`;
  }

  private buildMarketingText(
    name: string,
    price: string,
    desc: string,
    emojis: string,
    templates: any,
  ): string {
    const hook = this.random(templates.hooks);
    const cta = this.random(templates.ctas);

    return `${hook}

Are you looking for ${name.toLowerCase()}? Look no further!

${emojis} ${name}
💰 Just ${price}

Here's why you'll love it:
${desc}

✅ Quality guaranteed
✅ Fast delivery
✅ Best price on campus

${cta}

Share this with someone who needs it! 🔄`;
  }

  private buildShortCaption(
    name: string,
    price: string,
    emojis: string,
  ): string {
    const shortHooks = [
      `${emojis} ${name} — ${price} only!`,
      `Get ${name} for just ${price} ${emojis}`,
      `${name} at ${price}! ${emojis} Don't miss out!`,
      `🔥 ${name} • ${price} • Order now! ${emojis}`,
    ];
    return this.random(shortHooks);
  }
}

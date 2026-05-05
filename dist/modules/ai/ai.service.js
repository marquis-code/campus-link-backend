"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
let AiService = class AiService {
    generateCopy(dto) {
        const { productName, price, description, category, tone = 'casual' } = dto;
        const formattedPrice = `₦${price.toLocaleString()}`;
        const templates = this.getTemplates(tone);
        const emojis = this.getCategoryEmojis(category);
        const whatsappCaption = this.buildWhatsappCaption(productName, formattedPrice, description, emojis, templates);
        const marketingText = this.buildMarketingText(productName, formattedPrice, description, emojis, templates);
        const shortCaption = this.buildShortCaption(productName, formattedPrice, emojis);
        return { whatsappCaption, marketingText, shortCaption };
    }
    getTemplates(tone) {
        const toneMap = {
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
    getCategoryEmojis(category) {
        const emojiMap = {
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
    random(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    buildWhatsappCaption(name, price, desc, emojis, templates) {
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
    buildMarketingText(name, price, desc, emojis, templates) {
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
    buildShortCaption(name, price, emojis) {
        const shortHooks = [
            `${emojis} ${name} — ${price} only!`,
            `Get ${name} for just ${price} ${emojis}`,
            `${name} at ${price}! ${emojis} Don't miss out!`,
            `🔥 ${name} • ${price} • Order now! ${emojis}`,
        ];
        return this.random(shortHooks);
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)()
], AiService);
//# sourceMappingURL=ai.service.js.map
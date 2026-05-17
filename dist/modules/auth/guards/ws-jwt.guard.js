"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsJwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const auth_service_1 = require("../auth.service");
let WsJwtAuthGuard = class WsJwtAuthGuard {
    jwtService;
    authService;
    constructor(jwtService, authService) {
        this.jwtService = jwtService;
        this.authService = authService;
    }
    async canActivate(context) {
        try {
            const client = context.switchToWs().getClient();
            const authToken = client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.split(' ')[1];
            if (!authToken) {
                throw new websockets_1.WsException('Unauthorized');
            }
            const payload = this.jwtService.verify(authToken);
            const user = await this.authService.validateUserById(payload.sub);
            if (!user) {
                throw new websockets_1.WsException('Unauthorized');
            }
            client.user = user;
            return true;
        }
        catch (err) {
            throw new websockets_1.WsException('Unauthorized');
        }
    }
};
exports.WsJwtAuthGuard = WsJwtAuthGuard;
exports.WsJwtAuthGuard = WsJwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        auth_service_1.AuthService])
], WsJwtAuthGuard);
//# sourceMappingURL=ws-jwt.guard.js.map
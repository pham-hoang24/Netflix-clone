"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEventService = void 0;
const UserEventDAO_1 = require("../dao/UserEventDAO");
class UserEventService {
    constructor(dbInstance) {
        this.userEventDAO = new UserEventDAO_1.UserEventDAO(dbInstance);
    }
    logEvent(userId, userEmail, eventData) {
        return __awaiter(this, void 0, void 0, function* () {
            // The userId is already part of eventData.userId, so we just pass eventData
            return this.userEventDAO.createEvent(eventData);
        });
    }
    getEvents(userId, limit, eventType) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userEventDAO.getUserEvents(userId, limit, eventType);
        });
    }
}
exports.UserEventService = UserEventService;

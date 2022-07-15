import createHttpError from 'http-errors';
import {Request} from 'express';
import {JsonWebToken, JWTForm, ROLE} from '@lib/jwt-auth';
import {ErrorCode} from '@lib/http/error-code';
import {HttpStatus} from '@lib/http/status-code';

export class BaseRouteHandler {
    constructor() {}
    getBody(req: Request) {
        return req.body;
    }
    getParam(req: Request, field: string) {
        return req.params[field];
    }
    getQuery(req: Request) {
        return req.query as any;
    }
    getAuthorizedUser(req: Request) {
        const jwt = new JsonWebToken();
        return jwt.decryptToken(req.token);
    }
    assertAuthorizedUserRole(token: JWTForm, roles: ROLE[]) {
        if (!roles.some((role) => role === token.role)) {
            throw createHttpError(HttpStatus.FORBIDDEN, {errorCode: ErrorCode.USER_ROLE_FORBIDDEN});
        }
    }
}

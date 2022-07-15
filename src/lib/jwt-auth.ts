import * as jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import {HttpStatus} from '@lib/http/status-code';
import {ErrorCode} from '@lib/http/error-code';
import {envString} from '@lib/environment';

export interface IJsonWebToken {
    decryptToken(token?: string | null): Promise<JWTForm>;
    generateToken(token: JWTGenerateProps): string;
}
export class JsonWebToken implements IJsonWebToken {
    ACCESS_TOKEN_DURATION = 1000 * 60 * 60 * 3;
    secretKey = envString('SECRET_KEY');
    // 토큰 인증
    async decryptToken(token?: string | null) {
        return this.verifyToken<JWTForm>(token || '');
    }
    // 토큰 생성
    generateToken(signObject: JWTGenerateProps) {
        let iat = new Date().getTime();
        let expiresIn = iat + this.ACCESS_TOKEN_DURATION;
        return jwt.sign({...signObject}, this.secretKey, {algorithm: 'HS256', expiresIn});
    }

    protected async verifyToken<T>(token: string) {
        try {
            this.assertAuthorizedUser(token);
            const payload = await jwt.verify(token, this.secretKey, {algorithms: ['HS256']});
            return payload as T;
        } catch (err) {
            throw createHttpError(HttpStatus.UNAUTHORIZED, 'Unauthorized Token', {errorCode: ErrorCode.USER_UNAUTHORIZED});
        }
    }
    assertAuthorizedUser(token?: string | null) {
        if (!token) {
            throw createHttpError(HttpStatus.UNAUTHORIZED, 'Unauthorized Token', {errorCode: ErrorCode.USER_UNAUTHORIZED});
        }
    }
}

// JWT for users
export enum ROLE {
    USER = 'USER',
    WRITER = 'WRITER',
    EDITOR = 'EDITOR',
}
export type JWTForm = {
    id: number;
    role: ROLE;
    expireIn: number;
    iat: number;
};
export type JWTGenerateProps = {
    id: number;
    role: ROLE;
};

import * as mySQL from 'mysql';
import {OkPacket, Pool} from 'mysql';
import createError from 'http-errors';
import {HttpStatus} from '@lib/http/status-code';
import {ErrorCode} from '@lib/http/error-code';

export class MySQLConnection {
    private static instance: MySQLConnection;
    static getInstance() {
        if (!MySQLConnection.instance) {
            MySQLConnection.instance = new MySQLConnection();
        }
        return MySQLConnection.instance;
    }
    pool: Pool;
    constructor() {
        const connectOptions: mySQL.PoolConfig = {
            connectionLimit: 10,
            port: Number(process.env.MYSQL_PORT),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PWD,
            database: process.env.MYSQL_DATABASE_NAME,
            charset: 'utf8mb4',
            multipleStatements: true,
        };
        this.pool = mySQL.createPool(connectOptions);
    }

    async query<T>(queryString: string): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.pool.query(queryString, function (error, results: T[]) {
                if (error) {
                    console.log('query err', error);
                    const status = HttpStatus.INTERNAL_SERVER_ERROR;
                    const errorCode = ErrorCode.SQL_READ_ERROR;
                    reject(createError(status, {errorCode, level: 'critical', reason: error}));
                } else {
                    resolve(results);
                }
            });
        });
    }
    //쿼리 타입이 write( insert, update, delete ) 일 경우 사용
    async queryWrite(queryString: string): Promise<OkPacket> {
        return new Promise((resolve, reject) => {
            this.pool.query(queryString, function (error, results: OkPacket) {
                if (error) {
                    console.log('query err', error);
                    const status = HttpStatus.INTERNAL_SERVER_ERROR;
                    const errorCode = ErrorCode.SQL_WRITE_ERROR;
                    reject(createError(status, {errorCode, level: 'critical', reason: error}));
                } else {
                    resolve(results);
                }
            });
        });
    }
}

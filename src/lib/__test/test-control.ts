import chai from 'chai';
import app from '../../app';
import chaiHttp = require('chai-http');

export class TestControl {
    constructor() {
        chai.use(chaiHttp);
    }
    request = {
        post: (uri: string, json: any, header: object = {}): Promise<{status: number; body: any}> => {
            return new Promise((resolve) => {
                chai.request(app)
                    .post(uri)
                    .send(json)
                    .set(header)
                    .end((err, res) => {
                        if (err) {
                            console.log('chai request err', err);
                        }
                        resolve({status: res.status, body: res.body});
                    });
            });
        },
        put: (uri: string, json: any, header: object = {}): Promise<{status: number; body: any}> => {
            return new Promise((resolve) => {
                chai.request(app)
                    .put(uri)
                    .send(json)
                    .set(header)
                    .end((err, res) => {
                        if (err) {
                            console.log('chai request err', err);
                        }
                        resolve({status: res.status, body: res.body});
                    });
            });
        },
        patch: (uri: string, json: any, header: object = {}): Promise<{status: number; body: any}> => {
            return new Promise((resolve) => {
                chai.request(app)
                    .patch(uri)
                    .send(json)
                    .set(header)
                    .end((err, res) => {
                        if (err) {
                            console.log('chai request err', err);
                        }
                        resolve({status: res.status, body: res.body});
                    });
            });
        },
    };
}

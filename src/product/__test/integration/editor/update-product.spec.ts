import 'module-alias/register';
import chai from 'chai';
import {before} from 'mocha';
import {ProductBaseRepository} from '@infrastructure/database/product-base-repository';
import {ProductTestHelper} from '@test/helper/product';
import {TestControl} from '@lib/__test/test-control';
process.env.NODE_ENV = 'debug';

chai.should();
const testControl = new TestControl();
const testHelper = new ProductTestHelper();
const baseRepository = new ProductBaseRepository();
describe('[Integration] 에디터 상품 정보 변경', () => {
    let productId = 0;
    let uri = '/products/editor/';
    const writerId = 2;
    describe('상품 정보 변경: SUCCESS', () => {
        before('상품 정보 세팅', async () => {
            productId = await testHelper.addNewProduct(writerId);
            await testHelper.requestReview(writerId, productId);
        });
        it('상품 정보 수정시, HTTP Status 200 with OK', async () => {
            const editorToken =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkVESVRPUiIsImlhdCI6MTY1Nzg1NDYxNCwiZXhwIjoxNjU5NTk4ODY5MTk3fQ.P_bOXaTAwDEivxa_rBOcqd20cNmuMsA-joF9LpgHOWk';
            const Authorization = `Bearer ${editorToken}`;
            const title = '상품 수정';
            const content = '내용도 수정';
            const commissionRate = 10.5;
            const param = {title, content, commissionRate};
            const {status} = await testControl.request.put(uri + productId, param, {Authorization});
            chai.assert.equal(status, 200);
        });
        after('테스트 상품 제거', (done) => {
            baseRepository.remove({productId});
            done();
        });
    });

    describe('상품 정보 변경: ERROR', () => {
        let title: any = '상품 제목';
        let content: any = '상품 내용';
        const commissionRate = 10.5;
        beforeEach('상품 정보 세팅', async () => {
            productId = await testHelper.addNewProduct(writerId);
            await testHelper.requestReview(writerId, productId);
        });
        describe('[UnAuthorized] 인증되지 않은 유저', () => {
            it('Authorization 값 없는 경우, HTTP Status 401을 반환', async () => {
                const param = {title, content, commissionRate};
                const {status} = await testControl.request.put(uri + productId, param, {});
                chai.assert.equal(status, 401);
            });
        });
        describe('[Forbidden] 인증되지 않은 Role', () => {
            it('검토요청된 상품을 작가가 수정하려고 할때, HTTP Status 403을 반환', async () => {
                const writerToken =
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6IldSSVRFUiIsImlhdCI6MTY1Nzg1NDk3OSwiZXhwIjoxNjU5NTk5MjM0MDc5fQ.HghFqZiBpw9JtkMj-0kACQJfRmBfpsYiLrYF3-eUMiM';
                const Authorization = `Bearer ${writerToken}`;
                const param = {title, content, commissionRate};
                const {status} = await testControl.request.put(uri + productId, param, {Authorization});
                chai.assert.equal(status, 403);
            });
        });
        describe('[Bad Request] 타입 유효성', () => {
            const editorToken =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkVESVRPUiIsImlhdCI6MTY1Nzg1NDYxNCwiZXhwIjoxNjU5NTk4ODY5MTk3fQ.P_bOXaTAwDEivxa_rBOcqd20cNmuMsA-joF9LpgHOWk';
            const Authorization = `Bearer ${editorToken}`;

            it('가격 string, HTTP Status 400을 반환', async () => {
                const param = {title, content, commissionRate: '30,000원'};
                const {status, body} = await testControl.request.put(uri + productId, param, {Authorization});
                const errorMessage = body.error.errorMessage;
                chai.assert.equal(status, 400);
                chai.assert.include(errorMessage, `number`);
                chai.assert.include(errorMessage, `commissionRate`);
            });
            it('제목 null 값일 경우, HTTP Status 400을 반환', async () => {
                const param = {title: null, content, commissionRate};
                const {status, body} = await testControl.request.put(uri + productId, param, {Authorization});
                const errorMessage = body.error.errorMessage;
                chai.assert.equal(status, 400);
                chai.assert.include(errorMessage, `string`);
                chai.assert.include(errorMessage, `title`);
            });
            it('상품 내용(content) null 경우, HTTP Status 400을 반환', async () => {
                const param = {title, content: null, commissionRate};
                const {status, body} = await testControl.request.put(uri + productId, param, {Authorization});
                const errorMessage = body.error.errorMessage;
                chai.assert.equal(status, 400);
                chai.assert.include(errorMessage, `string`);
                chai.assert.include(errorMessage, `content`);
            });
        });
        describe('[Bad Request] 최소 길이 | 최소 값', () => {
            const editorToken =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkVESVRPUiIsImlhdCI6MTY1Nzg1NDYxNCwiZXhwIjoxNjU5NTk4ODY5MTk3fQ.P_bOXaTAwDEivxa_rBOcqd20cNmuMsA-joF9LpgHOWk';
            const Authorization = `Bearer ${editorToken}`;
            it('가격 0, HTTP Status 400을 반환', async () => {
                const param = {title, content, price: 0};
                const {status, body} = await testControl.request.put(uri + productId, param, {Authorization});
                const errorMessage = body.error.errorMessage;
                chai.assert.equal(status, 400);
                chai.assert.include(errorMessage, `must be >=`);
                chai.assert.include(errorMessage, `price`);
            });
            it('제목 빈 값일 경우, HTTP Status 400을 반환', async () => {
                const param = {title: '', content, commissionRate};
                const {status, body} = await testControl.request.put(uri + productId, param, {Authorization});
                const errorMessage = body.error.errorMessage;
                chai.assert.equal(status, 400);
                chai.assert.include(errorMessage, `NOT have fewer than 1`);
                chai.assert.include(errorMessage, `title`);
            });
            it('상품 내용 빈 값일 경우, HTTP Status 400을 반환', async () => {
                const param = {title, content: '', commissionRate};
                const {status, body} = await testControl.request.put(uri + productId, param, {Authorization});
                const errorMessage = body.error.errorMessage;
                chai.assert.equal(status, 400);
                chai.assert.include(errorMessage, `NOT have fewer than 1`);
                chai.assert.include(errorMessage, `content`);
            });
        });
        afterEach('테스트 상품 제거', (done) => {
            new ProductBaseRepository().remove({productId});
            done();
        });
    });
});

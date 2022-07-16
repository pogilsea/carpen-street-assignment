import 'module-alias/register';
import chai from 'chai';
import {ProductBaseRepository} from '@infrastructure/database/product-base-repository';
import {TestControl} from '@lib/__test/test-control';
import {before} from 'mocha';
import {ProductTestHelper} from '@test/helper/product';
process.env.NODE_ENV = 'debug';
chai.should();
const testControl = new TestControl();
const testHelper = new ProductTestHelper();
const baseRepository = new ProductBaseRepository();
describe('[Integration] 작가 상품 정보 수정', () => {
    let uri = '/products/writer/';
    let productId = 0;
    const writerId = 2;
    describe('상품 수정: SUCCESS', () => {
        before('상품 정보 세팅', async () => {
            productId = await testHelper.addNewProduct(writerId);
        });
        it('상품 정보 변경시, HTTP Status 200 with OK', async () => {
            const writerToken =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6IldSSVRFUiIsImlhdCI6MTY1Nzg1NDk3OSwiZXhwIjoxNjU5NTk5MjM0MDc5fQ.HghFqZiBpw9JtkMj-0kACQJfRmBfpsYiLrYF3-eUMiM';
            const Authorization = `Bearer ${writerToken}`;
            const title = '신규 상품 제목';
            const content = '신규 런칭 상품';
            const price = 115000;
            const param = {title, content, price};
            const {status} = await testControl.request.put(uri + productId, param, {Authorization});
            chai.assert.equal(status, 200);
        });
        after('테스트 상품 제거', (done) => {
            baseRepository.remove({productId});
            done();
        });
    });

    describe('상품 수정: ERROR', () => {
        let title: any = '상품 제목';
        let content: any = '상품 내용';
        let price: any = 105000;
        describe('[UnAuthorized] 인증되지 않은 유저', () => {
            before('상품 정보 세팅', async () => {
                productId = await testHelper.addNewProduct(writerId);
            });
            it('Authorization 값 없는 경우, HTTP Status 401을 반환', async () => {
                const param = {title, content, price};
                const {status} = await testControl.request.put(uri + productId, param, {});
                chai.assert.equal(status, 401);
            });
            after('테스트 상품 제거', (done) => {
                baseRepository.remove({productId});
                done();
            });
        });
        describe('[Forbidden] 인증되지 않은 Role', () => {
            before('상품 정보 세팅', async () => {
                productId = await testHelper.addNewProduct(writerId);
            });
            it('검토 대기 상품을 에디터가 상품을 수정하려고 할때, HTTP Status 403을 반환', async () => {
                const editorToken =
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkVESVRPUiIsImlhdCI6MTY1Nzg1NDYxNCwiZXhwIjoxNjU5NTk4ODY5MTk3fQ.P_bOXaTAwDEivxa_rBOcqd20cNmuMsA-joF9LpgHOWk';
                const Authorization = `Bearer ${editorToken}`;
                const param = {title, content, price};
                const {status} = await testControl.request.put(uri + productId, param, {Authorization});
                chai.assert.equal(status, 403);
            });
            after('테스트 상품 제거', (done) => {
                baseRepository.remove({productId});
                done();
            });
        });
        describe('[Bad Request] 타입 유효성', () => {
            const writerToken =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6IldSSVRFUiIsImlhdCI6MTY1Nzg1NDk3OSwiZXhwIjoxNjU5NTk5MjM0MDc5fQ.HghFqZiBpw9JtkMj-0kACQJfRmBfpsYiLrYF3-eUMiM';
            const Authorization = `Bearer ${writerToken}`;
            before('상품 정보 세팅', async () => {
                productId = await testHelper.addNewProduct(writerId);
            });
            it('가격 string, HTTP Status 400을 반환', async () => {
                const param = {title, content, price: '30,000원'};
                const {status, body} = await testControl.request.put(uri + productId, param, {Authorization});
                const errorMessage = body.error.errorMessage;
                chai.assert.equal(status, 400);
                chai.assert.include(errorMessage, `number`);
                chai.assert.include(errorMessage, `price`);
            });
            it('제목 null 값일 경우, HTTP Status 400을 반환', async () => {
                const param = {title: null, content, price};
                const {status, body} = await testControl.request.put(uri + productId, param, {Authorization});
                const errorMessage = body.error.errorMessage;
                chai.assert.equal(status, 400);
                chai.assert.include(errorMessage, `string`);
                chai.assert.include(errorMessage, `title`);
            });
            it('상품 내용(content) null 경우, HTTP Status 400을 반환', async () => {
                const param = {title, content: null, price};
                const {status, body} = await testControl.request.put(uri + productId, param, {Authorization});
                const errorMessage = body.error.errorMessage;
                chai.assert.equal(status, 400);
                chai.assert.include(errorMessage, `string`);
                chai.assert.include(errorMessage, `content`);
            });
            after('테스트 상품 제거', (done) => {
                baseRepository.remove({productId});
                done();
            });
        });
        describe('[Bad Request] 최소 길이 | 최소 값', () => {
            before('상품 정보 세팅', async () => {
                productId = await testHelper.addNewProduct(writerId);
            });
            const writerToken =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6IldSSVRFUiIsImlhdCI6MTY1Nzg1NDk3OSwiZXhwIjoxNjU5NTk5MjM0MDc5fQ.HghFqZiBpw9JtkMj-0kACQJfRmBfpsYiLrYF3-eUMiM';
            const Authorization = `Bearer ${writerToken}`;
            it('가격 0, HTTP Status 400을 반환', async () => {
                const param = {title, content, price: 0};
                const {status, body} = await testControl.request.put(uri + productId, param, {Authorization});
                const errorMessage = body.error.errorMessage;
                chai.assert.equal(status, 400);
                chai.assert.include(errorMessage, `must be >=`);
                chai.assert.include(errorMessage, `price`);
            });
            it('상품 제목 빈 값일 경우, HTTP Status 400을 반환', async () => {
                const param = {title: '', content, price};
                const {status, body} = await testControl.request.put(uri + productId, param, {Authorization});
                const errorMessage = body.error.errorMessage;
                chai.assert.equal(status, 400);
                chai.assert.include(errorMessage, `NOT have fewer than 1`);
                chai.assert.include(errorMessage, `title`);
            });
            it('상품 내용 빈 값일 경우, HTTP Status 400을 반환', async () => {
                const param = {title, content: '', price};
                const {status, body} = await testControl.request.put(uri + productId, param, {Authorization});
                const errorMessage = body.error.errorMessage;
                chai.assert.equal(status, 400);
                chai.assert.include(errorMessage, `NOT have fewer than 1`);
                chai.assert.include(errorMessage, `content`);
            });
            after('테스트 상품 제거', (done) => {
                baseRepository.remove({productId});
                done();
            });
        });
    });
});

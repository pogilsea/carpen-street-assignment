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
describe('[Integration] 작가 상품 검토 요청', () => {
    let uri = '/products/request-review/';
    let productId = 0;
    const writerId = 2;
    describe('상품 검토 요청: SUCCESS', () => {
        before('상품 정보 세팅', async () => {
            productId = await testHelper.addNewProduct(writerId);
        });
        it('상품 검토 요청시, HTTP Status 200 with OK', async () => {
            const writerToken =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6IldSSVRFUiIsImlhdCI6MTY1Nzg1NDk3OSwiZXhwIjoxNjU5NTk5MjM0MDc5fQ.HghFqZiBpw9JtkMj-0kACQJfRmBfpsYiLrYF3-eUMiM';
            const Authorization = `Bearer ${writerToken}`;
            const {status} = await testControl.request.patch(uri + productId, {}, {Authorization});
            chai.assert.equal(status, 200);
        });
        after('테스트 상품 제거', (done) => {
            baseRepository.remove({productId});
            done();
        });
    });

    describe('상품 검토 요청시 ERROR', () => {
        let title: any = '상품 제목';
        let content: any = '상품 내용';
        let price: any = 105000;
        beforeEach('상품 정보 세팅', async () => {
            productId = await testHelper.addNewProduct(writerId);
        });
        describe('[UnAuthorized] 인증되지 않은 유저', () => {
            it('Authorization 값 없는 경우, HTTP Status 401을 반환', async () => {
                const param = {title, content, price};
                const {status} = await testControl.request.patch(uri + productId, param, {});
                chai.assert.equal(status, 401);
            });
        });
        describe('[Forbidden] 인증되지 않은 Role', () => {
            it('에디터가 검토 요청할 때, HTTP Status 403을 반환', async () => {
                const editorToken =
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkVESVRPUiIsImlhdCI6MTY1Nzg1NDYxNCwiZXhwIjoxNjU5NTk4ODY5MTk3fQ.P_bOXaTAwDEivxa_rBOcqd20cNmuMsA-joF9LpgHOWk';
                const Authorization = `Bearer ${editorToken}`;
                const param = {title, content, price};
                const {status} = await testControl.request.patch(uri + productId, param, {Authorization});
                chai.assert.equal(status, 403);
            });
        });
        afterEach('테스트 상품 제거', (done) => {
            baseRepository.remove({productId});
            done();
        });
    });
});

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
describe('[Integration] 에디터 상품 검토 롤백', () => {
    let productId = 0;
    let uri = '/products/rollback-review/';
    const writerId = 2;
    describe('상품 검토 롤백: SUCCESS', () => {
        before('상품 정보 세팅', async () => {
            productId = await testHelper.addNewProduct(writerId);
            await testHelper.requestReview(writerId, productId);
        });
        it('상품 검토 롤백시, HTTP Status 200 with OK', async () => {
            const editorToken =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkVESVRPUiIsImlhdCI6MTY1Nzg1NDYxNCwiZXhwIjoxNjU5NTk4ODY5MTk3fQ.P_bOXaTAwDEivxa_rBOcqd20cNmuMsA-joF9LpgHOWk';
            const Authorization = `Bearer ${editorToken}`;
            const {status} = await testControl.request.patch(uri + productId, {}, {Authorization});
            chai.assert.equal(status, 200);
        });
        after('테스트 상품 제거', (done) => {
            baseRepository.remove({productId});
            done();
        });
    });

    describe('상품 검토 롤백: ERROR', () => {
        beforeEach('상품 정보 세팅', async () => {
            productId = await testHelper.addNewProduct(writerId);
            await testHelper.requestReview(writerId, productId);
        });
        describe('[UnAuthorized] 인증되지 않은 유저', () => {
            it('Authorization 값 없는 경우, HTTP Status 401을 반환', async () => {
                const {status} = await testControl.request.patch(uri + productId, {}, {});
                chai.assert.equal(status, 401);
            });
        });
        describe('[Forbidden] 인증되지 않은 Role', () => {
            it('수정 요청을 에디터가 하려고 할때, HTTP Status 403을 반환', async () => {
                const writerToken =
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6IldSSVRFUiIsImlhdCI6MTY1Nzg1NDk3OSwiZXhwIjoxNjU5NTk5MjM0MDc5fQ.HghFqZiBpw9JtkMj-0kACQJfRmBfpsYiLrYF3-eUMiM';
                const Authorization = `Bearer ${writerToken}`;
                const {status} = await testControl.request.patch(uri + productId, {}, {Authorization});
                chai.assert.equal(status, 403);
            });
        });
        afterEach('테스트 상품 제거', (done) => {
            new ProductBaseRepository().remove({productId});
            done();
        });
    });
});

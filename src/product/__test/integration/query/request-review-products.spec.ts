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
describe('[Integration] 에디터가 검토 요청 상품 리스트 조회', () => {
    let uri = '/products/request-review';
    let productId = 0;
    let writerId = 2;
    describe('검토 요청 상품 리스트 조회: SUCCESS', () => {
        let statusValue: any, bodyObject: any;
        before('상품 정보 2개 세팅', async () => {
            await Promise.all([testHelper.generateReviewRequestProduct(writerId), testHelper.generateReviewRequestProduct(writerId)]);
        });
        before('검토 요청 상품 리스트 API 결과값 세팅', async () => {
            const editorToken =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkVESVRPUiIsImlhdCI6MTY1Nzg1NDYxNCwiZXhwIjoxNjU5NTk4ODY5MTk3fQ.P_bOXaTAwDEivxa_rBOcqd20cNmuMsA-joF9LpgHOWk';
            const Authorization = `Bearer ${editorToken}`;
            const {status, body} = await testControl.request.get(uri, {Authorization});
            statusValue = status;
            bodyObject = body;
        });
        it('검토 요청 상품 리스트 조회시, HTTP Status 200 with OK', async () => {
            chai.assert.equal(statusValue, 200);
        });
        it('검토 요청 상품 리스트 조회시, 결과 리스트 defined', async () => {
            chai.assert.isDefined(bodyObject.result.products);
        });
        it('검토 요청 상품 리스트 조회시, 결과 리스트 길이 최소 2개 이상', async () => {
            chai.assert.isAtLeast(bodyObject.result.products.length, 2);
        });
        after('테스트 상품 제거', (done) => {
            baseRepository.remove({writerId});
            done();
        });
    });
    describe('검토 요청 상품 리스트 조회: ERROR', () => {
        beforeEach('상품 정보 세팅', async () => {
            productId = await testHelper.generateReviewRequestProduct(writerId);
        });
        describe('[UnAuthorized] 인증되지 않은 유저', () => {
            it('Authorization 값 없는 경우, HTTP Status 401을 반환', async () => {
                const {status} = await testControl.request.get(uri, {});
                chai.assert.equal(status, 401);
            });
        });
        describe('[Forbidden] 인증되지 않은 Role', () => {
            it('검토 요청 리스트 API를 작가가 접근 하려고 할때, HTTP Status 403을 반환', async () => {
                const writerToken =
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6IldSSVRFUiIsImlhdCI6MTY1Nzg1NDk3OSwiZXhwIjoxNjU5NTk5MjM0MDc5fQ.HghFqZiBpw9JtkMj-0kACQJfRmBfpsYiLrYF3-eUMiM';
                const Authorization = `Bearer ${writerToken}`;
                const {status} = await testControl.request.get(uri, {Authorization});
                chai.assert.equal(status, 403);
            });
        });
        afterEach('테스트 상품 제거', (done) => {
            new ProductBaseRepository().remove({productId});
            done();
        });
    });
});

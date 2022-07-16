import 'module-alias/register';
import chai from 'chai';
import {ProductBaseRepository} from '@infrastructure/database/product-base-repository';
import {TestControl} from '@lib/__test/test-control';
import {before} from 'mocha';
import {ProductTestHelper} from '@test/helper/product';

process.env.NODE_ENV = 'debug';
chai.should();
const testHelper = new ProductTestHelper();
const testControl = new TestControl();
const baseRepository = new ProductBaseRepository();
describe('[Integration] 검토 승인(발행)된 상품 리스트 조회', () => {
    let uri = '/products/published';
    const writerId = 2;
    describe('발행된 상품 리스트 조회: SUCCESS', () => {
        let statusValue: any, bodyObject: any;
        before('상품 정보 2개 세팅', async () => {
            await Promise.all([testHelper.generatePublishedProduct(writerId), testHelper.generatePublishedProduct(writerId)]);
        });
        before('발행된 상품 리스트 API 결과값 세팅', async () => {
            const {status, body} = await testControl.request.get(uri);
            statusValue = status;
            bodyObject = body;
        });
        it('발행된 상품 리스트 요청시, HTTP Status 200 with OK', async () => {
            chai.assert.equal(statusValue, 200);
        });
        it('발행된 상품 리스트 요청시, 결과 리스트 defined', async () => {
            chai.assert.isDefined(bodyObject.result.products);
        });
        it('발행된 상품 리스트 요청시, 결과 리스트 길이 최소 2개 이상', async () => {
            chai.assert.isAtLeast(bodyObject.result.products.length, 2);
        });
        after('테스트 상품 제거', (done) => {
            baseRepository.remove({writerId});
            done();
        });
    });
});

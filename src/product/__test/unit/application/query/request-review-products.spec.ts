import 'module-alias/register';
import chai from 'chai';
import {ProductBaseRepository} from '@infrastructure/database/product-base-repository';
import {before} from 'mocha';
import {ProductTestHelper} from '@test/helper/product';
import {QueryRequestReviewProducts} from '@application/query/request-review-products';
import {ProductStatus} from '@infrastructure/database/product-schema';

process.env.NODE_ENV = 'debug';
chai.should();

const testHelper = new ProductTestHelper();
const queryRequestReviewProducts = new QueryRequestReviewProducts();
const baseRepository = new ProductBaseRepository();
describe('[Query] 에디터가 검토 요청 상품 리스트 조회', () => {
    const writerId = 2;
    describe('리스폰스 값 유효성 확인', () => {
        before('상품 정보 세팅', async () => {
            await Promise.all([
                testHelper.generateReviewRequestProduct(writerId),
                testHelper.generateReviewRequestProduct(writerId),
                testHelper.generateReviewRequestProduct(writerId),
            ]);
        });
        it('검토 요청 상품 리스트 조회시, 타입 확인 일치', async () => {
            let products = await queryRequestReviewProducts.run();
            products.forEach((product) => {
                chai.assert.isNumber(product.id);
                chai.assert.isNumber(product.price);
                chai.assert.isDefined(product.reviewRequestedAt);
                chai.assert.isDefined(product.createdAt);
                chai.assert.isString(product.title);
                chai.assert.isString(product.content);
            });
        });
        it('검토 요청 상품 리스트 조회시, 상태값 "REVIEW_REQUESTED" 값만 노출되어야 함', async () => {
            let products = await queryRequestReviewProducts.run();
            products.forEach((product) => {
                chai.assert.equal(product.status, ProductStatus.REVIEW_REQUESTED);
            });
        });
        after('테스트 상품 제거', (done) => {
            baseRepository.remove({writerId});
            done();
        });
    });
});

import 'module-alias/register';
import chai from 'chai';
import {before} from 'mocha';
import {ProductBaseRepository} from '@infrastructure/database/product-base-repository';
import {ProductStatus, ProductTableSchemaType} from '@infrastructure/database/product-schema';
import {ProductTestHelper} from '@test/helper/product';
import createHttpError from 'http-errors';
import {RollbackReviewUseCase} from '@application/use-case/editor/rollback-review';

process.env.NODE_ENV = 'debug';
chai.should();
const productRepo = new ProductBaseRepository();
const testHelper = new ProductTestHelper();
const rollbackReviewUseCase = new RollbackReviewUseCase();
describe('[Application] 에디터 상품 수정 요청 승인 완료', () => {
    describe('에디터 상품 수정 요청 승인 완료: SUCCESS', () => {
        let productId = 0;
        const writerId = 2;
        before('작가: 상품 정보 추가', async () => {
            productId = await testHelper.addNewProduct(writerId);
        });
        before('작가: 상품 검토 요청', async () => {
            await testHelper.requestReview(writerId, productId);
        });
        before('상품 정보 수정 (commission rate)', async () => {
            await testHelper.updateCommissionRate(productId);
        });
        before('상품 검토 완료', async () => {
            await testHelper.completeReview(productId);
        });
        before('상품 수정 요청', async () => {
            await testHelper.requestReview(writerId, productId);
        });
        before('상품 수정 요청 승인 완료', async () => {
            await testHelper.rollbackReview(productId);
        });
        it('상품 수정 요청 승인 완료시, 상태 값은 초기(INITIALIZED) 값이 됨.', async () => {
            const product = await productRepo.readOne<ProductTableSchemaType>({productId});
            chai.assert.equal(product.status, ProductStatus.INITIALIZED);
        });
        after('테스트 상품 제거', (done) => {
            productRepo.remove({productId});
            done();
        });
    });

    describe('상품 정보 변경: ERROR', () => {
        let publishedProductId = 0;
        let deletedProductId = 0;
        const writerId = 2;
        before('작가: 상품 정보 추가', async () => {
            publishedProductId = await testHelper.addNewProduct(writerId);
        });
        before('작가: 상품 검토 요청', async () => {
            await testHelper.requestReview(writerId, publishedProductId);
        });
        before('상품 정보 수정 (commission rate)', async () => {
            await testHelper.updateCommissionRate(publishedProductId);
        });
        before('상품 검토 완료', async () => {
            await testHelper.completeReview(publishedProductId);
        });
        before('상품 삭제', async () => {
            deletedProductId = await testHelper.addNewProduct(writerId);
            await testHelper.removeProduct(deletedProductId);
        });

        it('검토 완료 상품을 롤백(초기 상태 변경)하려고 할때, Bad Request 에러 인스턴스 throw', async () => {
            let error;
            try {
                const param = {productId: publishedProductId};
                await rollbackReviewUseCase.run(param);
            } catch (err) {
                error = err;
            }
            chai.assert.instanceOf(error, createHttpError.BadRequest);
        });
        it('삭제된 상품을 롤백하려고 할때, Gone 에러 인스턴스 throw', async () => {
            let error;
            try {
                const param = {productId: deletedProductId};
                await rollbackReviewUseCase.run(param);
            } catch (err) {
                error = err;
            }
            chai.assert.instanceOf(error, createHttpError.Gone);
        });
        after('테스트 상품 제거', (done) => {
            productRepo.remove({productId: publishedProductId});
            done();
        });
    });
});

import 'module-alias/register';
import chai from 'chai';
import {before} from 'mocha';
import {ProductBaseRepository} from '@infrastructure/database/product-base-repository';
import {ProductStatus, ProductTableSchemaType} from '@infrastructure/database/product-schema';
import {ProductTestHelper} from '@test/helper/product';
import createHttpError from 'http-errors';
import {RequestReviewUseCase} from '@application/use-case/writer/request-review';

process.env.NODE_ENV = 'debug';
chai.should();
const productRepo = new ProductBaseRepository();
const testHelper = new ProductTestHelper();
const requestReviewUseCase = new RequestReviewUseCase();
describe('[Application] 작가 상품 검토 요청', () => {
    describe('상품 등록 후 검토 요청: SUCCESS', () => {
        let productId = 0;
        const writerId = 2;
        before('작가: 상품 정보 추가', async () => {
            productId = await testHelper.addNewProduct(writerId);
        });
        before('작가: 상품 검토 요청', async () => {
            await testHelper.requestReview(writerId, productId);
        });

        it('상품 검토 요청시, 상태 값은 REVIEW_REQUESTED 값이 됨.', async () => {
            const product = await productRepo.readOne<ProductTableSchemaType>({productId});
            chai.assert.equal(product.status, ProductStatus.REVIEW_REQUESTED);
        });
        it('상품 검토 완료시, review requested at 값 null 아님.', async () => {
            const product = await productRepo.readOne<ProductTableSchemaType>({productId});
            chai.assert.isNotNull(product.reviewRequestedAt);
        });
        after('테스트 상품 제거', (done) => {
            productRepo.remove({productId});
            done();
        });
    });

    describe('상품 등록 검토 승인 후 수정 요청: SUCCESS', () => {
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
        it('상품 검토 완료 후 재검토 요청시, 상태 값은 REVIEW_REQUESTED 값이 됨.', async () => {
            const product = await productRepo.readOne<ProductTableSchemaType>({productId});
            chai.assert.equal(product.status, ProductStatus.REVIEW_REQUESTED);
        });
        it('상품 검토 완료시, review requested at 값 null 아님.', async () => {
            const product = await productRepo.readOne<ProductTableSchemaType>({productId});
            chai.assert.isNotNull(product.reviewRequestedAt);
        });
        after('테스트 상품 제거', (done) => {
            productRepo.remove({productId});
            done();
        });
    });

    describe('상품 정보 변경: ERROR', () => {
        let requestReviewProductId = 0;
        let deletedProductId = 0;
        const writerId = 2;
        before('작가: 상품 정보 추가', async () => {
            requestReviewProductId = await testHelper.addNewProduct(writerId);
        });
        before('작가: 상품 검토 요청', async () => {
            await testHelper.requestReview(writerId, requestReviewProductId);
        });
        before('상품 삭제', async () => {
            deletedProductId = await testHelper.addNewProduct(writerId);
            await testHelper.removeProduct(deletedProductId);
        });
        it('검토 요청한 상품을 재요청하려고 할때, Bad Request 에러 인스턴스 throw', async () => {
            let error;
            try {
                const param = {writerId, productId: requestReviewProductId};
                await requestReviewUseCase.run(param);
            } catch (err) {
                error = err;
            }
            chai.assert.instanceOf(error, createHttpError.BadRequest);
        });

        it('삭제된 상품을 검토 요청하려고 할때, Gone 에러 인스턴스 throw', async () => {
            let error;
            try {
                const param = {writerId, productId: deletedProductId};
                await requestReviewUseCase.run(param);
            } catch (err) {
                error = err;
            }
            chai.assert.instanceOf(error, createHttpError.Gone);
        });
        after('테스트 상품 제거', (done) => {
            new ProductBaseRepository().remove({productId: requestReviewProductId});
            done();
        });
    });
});

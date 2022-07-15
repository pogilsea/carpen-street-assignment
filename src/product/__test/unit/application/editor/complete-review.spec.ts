import 'module-alias/register';
import chai from 'chai';
import {before} from 'mocha';
import {ProductBaseRepository} from '@infrastructure/database/product-base-repository';
import {ProductStatus, ProductTableSchemaType} from '@infrastructure/database/product-schema';
import {ProductTestHelper} from '@test/helper/product';
import createHttpError from 'http-errors';
import {CompleteReviewUseCase} from '@application/use-case/editor/complete-review';
import chaiHttp = require('chai-http');

process.env.NODE_ENV = 'debug';
chai.use(chaiHttp);
chai.should();
const productRepo = new ProductBaseRepository();
const testHelper = new ProductTestHelper();
const completeReviewUseCase = new CompleteReviewUseCase();
describe('[Application] 에디터 상품 검토 완료', () => {
    describe('에디터 상품 검토 완료: SUCCESS', () => {
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
            const param = {productId};
            const completeReviewUseCase = new CompleteReviewUseCase();
            await completeReviewUseCase.run(param);
        });
        it('상품 검토 완료시, 상태 값은 PUBLISHED 값이 됨.', async () => {
            const product = await productRepo.readOne<ProductTableSchemaType>({productId});
            chai.assert.equal(product.status, ProductStatus.PUBLISHED);
        });
        it('상품 검토 완료시, 발행일 값 null 아님.', async () => {
            const product = await productRepo.readOne<ProductTableSchemaType>({productId});
            chai.assert.isNotNull(product.publishedAt);
        });
        it('상품 검토 완료시, 번역 값(title, content) null 아님.', async () => {
            const product = await productRepo.readOne<ProductTableSchemaType>({productId});
            chai.assert.isNotNull(product.titleCn);
            chai.assert.isNotNull(product.contentCn);
            chai.assert.isNotNull(product.titleEn);
            chai.assert.isNotNull(product.contentEn);
        });

        after('테스트 상품 제거', (done) => {
            productRepo.remove({productId});
            done();
        });
    });

    describe('상품 검토 완료: ERROR', () => {
        let productId = 0;
        let requestReviewId = 0;
        let publishedProductId = 0;
        let deletedProductId = 0;
        const writerId = 2;
        before('작가: 상품 정보 추가', async () => {
            productId = await testHelper.addNewProduct(writerId);
        });
        before('작가: 상품 검토 요청', async () => {
            requestReviewId = await testHelper.addNewProduct(writerId);
            await testHelper.requestReview(writerId, requestReviewId);
        });
        before('상품 검토 완료', async () => {
            publishedProductId = await testHelper.addNewProduct(writerId);
            await testHelper.requestReview(writerId, publishedProductId);
            await testHelper.updateCommissionRate(publishedProductId);
            await testHelper.completeReview(publishedProductId);
        });
        before('상품 삭제', async () => {
            deletedProductId = await testHelper.addNewProduct(writerId);
            await testHelper.removeProduct(deletedProductId);
        });

        it('검토 요청전 상품을 에디터가 검토 완료하려고 할때, Bad Request 에러 인스턴스 throw', async () => {
            let error;
            try {
                const param = {productId};
                const completeReviewUseCase = new CompleteReviewUseCase();
                await completeReviewUseCase.run(param);
            } catch (err) {
                error = err;
            }
            chai.assert.instanceOf(error, createHttpError.BadRequest);
        });
        it('수수료 책정 하지 않고 검토 완료하려고 할때, Bad Request 에러 인스턴스 throw', async () => {
            let error;
            try {
                const param = {productId: requestReviewId};
                await completeReviewUseCase.run(param);
            } catch (err) {
                error = err;
            }
            chai.assert.instanceOf(error, createHttpError.Conflict);
        });
        it('이미 검토 완료된 상품을 에디터가 검토 완료하려고 할때, Bad Request 에러 인스턴스 throw', async () => {
            let error;
            try {
                const param = {productId: publishedProductId};
                await completeReviewUseCase.run(param);
            } catch (err) {
                error = err;
            }
            chai.assert.instanceOf(error, createHttpError.BadRequest);
        });

        it('삭제된 상품을 검토 완료하려고 할 때, Gone 에러 인스턴스 throw', async () => {
            let error;
            try {
                const param = {productId: deletedProductId};
                await completeReviewUseCase.run(param);
            } catch (err) {
                error = err;
            }
            chai.assert.instanceOf(error, createHttpError.Gone);
        });
        after('테스트 상품 제거', (done) => {
            Promise.all([
                productRepo.remove({productId}),
                productRepo.remove({productId: publishedProductId}),
                productRepo.remove({productId: requestReviewId}),
            ]);
            done();
        });
    });
});

import 'module-alias/register';
import chai from 'chai';
import {before} from 'mocha';
import {ProductBaseRepository} from '@infrastructure/database/product-base-repository';
import {ProductTableSchemaType} from '@infrastructure/database/product-schema';
import {ProductTestHelper} from '@test/helper/product';
import createHttpError from 'http-errors';
import {UpdateProductByWriterUseCase} from '@application/use-case/writer/update-product';

process.env.NODE_ENV = 'debug';
chai.should();
const productRepo = new ProductBaseRepository();
const testHelper = new ProductTestHelper();
const updateProductByWriterUseCase = new UpdateProductByWriterUseCase();
describe('[Application] 작가 상품 정보 변경', () => {
    describe('상품 정보 변경: SUCCESS', () => {
        let productId = 0;
        const writerId = 2;
        before('작가: 상품 정보 추가', async () => {
            productId = await testHelper.addNewProduct(writerId);
        });
        before('상품 정보 수정 (commission rate, title, content, price)', async () => {
            const price = 15900;
            const commissionRate = 14;
            const content = '내용 수정123';
            const title = '제목 수정';
            const param = {writerId, commissionRate, productId, price, content, title};
            await updateProductByWriterUseCase.run(param);
        });
        it('상품의 14로 변경시, 상품 수수료 값은 변경되지 않음.', async () => {
            const product = await productRepo.readOne<ProductTableSchemaType>({productId});
            chai.assert.notEqual(product.commissionRate, 14);
        });
        it('상품 내용 "내용 수정123"로 변경시, 상품 내용 값 일관성 유지.', async () => {
            const product = await productRepo.readOne<ProductTableSchemaType>({productId});
            chai.assert.equal(product.content, '내용 수정123');
        });
        it('상품 제목 "제목 수정"로 변경시, 상품 제목 값은  일관성 유지.', async () => {
            const product = await productRepo.readOne<ProductTableSchemaType>({productId});
            chai.assert.equal(product.title, '제목 수정');
        });
        after('테스트 상품 제거', (done) => {
            productRepo.remove({productId});
            done();
        });
    });

    describe('상품 정보 변경: ERROR', () => {
        let productId = 0;
        let requestReviewId = 0;
        let deletedProductId = 0;
        const writerId = 2;
        before('작가: 상품 상품 추가', async () => {
            productId = await testHelper.addNewProduct(writerId);
        });
        before('작가: 상품 정보 추가+검토 요청', async () => {
            requestReviewId = await testHelper.addNewProduct(writerId);
            await testHelper.requestReview(writerId, requestReviewId);
        });

        before('상품 삭제', async () => {
            deletedProductId = await testHelper.addNewProduct(writerId);
            await testHelper.removeProduct(deletedProductId);
        });

        it('작가가 검토 요청후 상품을 수정하려고 할때, Bad Request 에러 인스턴스 throw', async () => {
            let error;
            try {
                const title = '상품 제목1';
                const param = {title, writerId, productId: requestReviewId};
                await updateProductByWriterUseCase.run(param);
            } catch (err) {
                error = err;
            }
            chai.assert.instanceOf(error, createHttpError.BadRequest);
        });
        it('상품 제목을 영어로 변경 할때, Bad Request 에러 인스턴스 throw', async () => {
            let error;
            try {
                const title = '상품 제목1 ass';
                const param = {title, writerId, productId};
                const response = await updateProductByWriterUseCase.run(param);
                chai.assert.isDefined(response);
            } catch (err) {
                error = err;
            }
            chai.assert.instanceOf(error, createHttpError.BadRequest);
        });
        it('삭제된 상품을 수정하려고 할때, Gone 에러 인스턴스 throw', async () => {
            let error;
            try {
                const title = '상품 제목1';
                const param = {title, writerId, productId: deletedProductId};
                await updateProductByWriterUseCase.run(param);
            } catch (err) {
                error = err;
            }
            chai.assert.instanceOf(error, createHttpError.Gone);
        });
        after('테스트 상품 제거', (done) => {
            Promise.all([productRepo.remove({productId}), productRepo.remove({productId: requestReviewId})]);
            done();
        });
    });
});

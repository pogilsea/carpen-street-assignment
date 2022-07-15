import 'module-alias/register';
import chai from 'chai';
import {before} from 'mocha';
import {ProductBaseRepository} from '@infrastructure/database/product-base-repository';
import {UpdateProductByEditorUseCase} from '@application/use-case/editor/update-product';
import {ProductTableSchemaType} from '@infrastructure/database/product-schema';
import {ProductTestHelper} from '@test/helper/product';
import createHttpError from 'http-errors';
process.env.NODE_ENV = 'debug';

chai.should();
const productRepo = new ProductBaseRepository();
const testHelper = new ProductTestHelper();
const updateProductByEditorUseCase = new UpdateProductByEditorUseCase();
describe('[Application] 에디터 상품 정보 변경', () => {
    describe('상품 정보 변경: SUCCESS', () => {
        let productId = 0;
        const writerId = 2;

        before('작가: 상품 정보 추가', async () => {
            productId = await testHelper.addNewProduct(writerId);
        });
        before('작가: 상품 검토 요청', async () => {
            await testHelper.requestReview(writerId, productId);
        });
        before('상품 정보 수정 (commission rate, title, content, price)', async () => {
            const commissionRate = 10.5;
            const price = 15900;
            const content = '내용 수정1';
            const title = '제목 수정1';
            const param = {commissionRate, productId, price, content, title};
            await updateProductByEditorUseCase.run(param);
        });
        it('상품의 수수료를 10.5로 변경시, 상품 수수료 값은 10.5가 됨.', async () => {
            const product = await productRepo.readOne<ProductTableSchemaType>({productId});
            chai.assert.equal(product.commissionRate, 10.5);
        });
        it('상품 내용 "내용 수정1"로 변경시, 상품 내용 값은 "내용 수정1"가 됨.', async () => {
            const product = await productRepo.readOne<ProductTableSchemaType>({productId});
            chai.assert.equal(product.content, '내용 수정1');
        });
        it('상품 제목 "제목 수정1"로 변경시, 상품 제목 값은 "제목 수정1"가 됨.', async () => {
            const product = await productRepo.readOne<ProductTableSchemaType>({productId});
            chai.assert.equal(product.title, '제목 수정1');
        });
        after('테스트 상품 제거', (done) => {
            productRepo.remove({productId});
            done();
        });
    });

    describe('상품 정보 변경: ERROR', () => {
        let productId = 0;
        let requestReviewProductId = 0;
        let deletedProductId = 0;
        const writerId = 2;
        before('작가: 상품 정보 추가', async () => {
            productId = await testHelper.addNewProduct(writerId);
        });
        before('작가: 상품 검토 요청', async () => {
            requestReviewProductId = await testHelper.addNewProduct(writerId);
            await testHelper.requestReview(writerId, requestReviewProductId);
        });
        before('상품 삭제', async () => {
            deletedProductId = await testHelper.addNewProduct(writerId);
            await testHelper.removeProduct(deletedProductId);
        });

        it('검토 요청전 상품을 에디터가 수정하려고 할때, Bad Request 에러 인스턴스 throw', async () => {
            let error;
            try {
                const title = '상품 제목';
                const param = {title, productId};
                await updateProductByEditorUseCase.run(param);
            } catch (err) {
                error = err;
            }
            chai.assert.instanceOf(error, createHttpError.BadRequest);
        });
        it('상품제목을 영어로 할때, Bad Request 에러 인스턴스 throw', async () => {
            let error;
            try {
                const title = 'edit product title!';
                const param = {title, productId: requestReviewProductId};
                await updateProductByEditorUseCase.run(param);
            } catch (err) {
                error = err;
            }
            chai.assert.instanceOf(error, createHttpError.BadRequest);
        });
        it('삭제된 상품을 수정하려고 할때, Gone 에러 인스턴스 throw', async () => {
            let error;
            try {
                const title = '제목 수정1';
                const param = {title, productId: deletedProductId};
                await updateProductByEditorUseCase.run(param);
            } catch (err) {
                error = err;
            }
            chai.assert.instanceOf(error, createHttpError.Gone);
        });
        after('테스트 상품 제거', (done) => {
            Promise.all([productRepo.remove({productId}), productRepo.remove({productId: requestReviewProductId})]);
            done();
        });
    });
});

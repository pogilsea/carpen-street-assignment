import 'module-alias/register';
import chai from 'chai';
import {before} from 'mocha';
import {ProductBaseRepository} from '@infrastructure/database/product-base-repository';
import {ProductTableSchemaType} from '@infrastructure/database/product-schema';
import createHttpError from 'http-errors';
import {CreateProductUseCase} from '@application/use-case/writer/create-product';

process.env.NODE_ENV = 'debug';
chai.should();
const productRepo = new ProductBaseRepository();
const createProductUseCase = new CreateProductUseCase();

describe('[Application] 작가 상품 정보 신규 작성', () => {
    describe('에디터 상품 정보 변경: SUCCESS', () => {
        let productId = 0;
        const writerId = 2;
        before('작가: 상품 정보 추가', async () => {
            const title = '신규 제목!!';
            const content = '신규 콘텐츠1';
            const price = 100000;
            const props = {writerId, title, content, price};
            productId = await createProductUseCase.run(props);
        });
        it('상품의 가격을 100000 추가시, 상품 가격은 100000 됨.', async () => {
            const product = await productRepo.readOne<ProductTableSchemaType>({productId});
            chai.assert.equal(product.price, 100000);
        });
        it('상품 내용 "신규 제목!!"로 변경시, 상품 내용 값은 "신규 제목!!"가 됨.', async () => {
            const product = await productRepo.readOne<ProductTableSchemaType>({productId});
            chai.assert.equal(product.title, '신규 제목!!');
        });
        it('상품 제목 "신규 콘텐츠1"로 변경시, 상품 제목 값은 "신규 콘텐츠1"가 됨.', async () => {
            const product = await productRepo.readOne<ProductTableSchemaType>({productId});
            chai.assert.equal(product.content, '신규 콘텐츠1');
        });
        after('테스트 상품 제거', (done) => {
            productRepo.remove({productId});
            done();
        });
    });

    describe('상품 정보 추가: ERROR', () => {
        const writerId = 2;
        it('상품 제목 영어로 입력시, Bad Request 에러 인스턴스 throw', async () => {
            let error;
            try {
                const title = '新商!@#!@%';
                const content = '新商ㅇㅇㅇ!@#!@%';
                const price = 15000;
                const param = {title, price, content, writerId};
                const response = await createProductUseCase.run(param);
                chai.assert.isNotEmpty(response);
            } catch (err) {
                error = err;
            }
            chai.assert.instanceOf(error, createHttpError.BadRequest);
        });
    });
});

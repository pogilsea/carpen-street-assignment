import 'module-alias/register';
import chai from 'chai';
import {ProductBaseRepository} from '@infrastructure/database/product-base-repository';
import {before} from 'mocha';
import {ProductTestHelper} from '@test/helper/product';
import {PublishedProductListItemDTO, QueryPublishedProducts} from '@application/query/published-products';
import {RegexConverter} from '@lib/regex-converter';

process.env.NODE_ENV = 'debug';
chai.should();
const testHelper = new ProductTestHelper();
const regex = new RegexConverter();
const queryPublishedProducts = new QueryPublishedProducts();
const baseRepository = new ProductBaseRepository();
describe('[Query] 발행 완료된 상품 리스트 조회', () => {
    const writerId = 2;
    describe('엔티티 타입 일치 여부 확인', function () {
        before('상품 정보 세팅', async () => {
            await Promise.all([
                testHelper.generatePublishedProduct(writerId),
                testHelper.generatePublishedProduct(writerId),
                testHelper.generatePublishedProduct(writerId),
            ]);
        });
        it('발행된 상품 리스트 조회시, 값 유효성 일치', async () => {
            let products = await queryPublishedProducts.run({nationCode: 'ko'});
            products.forEach((product) => {
                chai.assert.isNotNull(product.id);
                chai.assert.isNotNull(product.publishedAt);
                chai.assert.isAbove(product.price, 0);
                chai.assert.isNotNull(product.title);
                chai.assert.isNotNull(product.content);
            });
        });
        after('테스트 상품 제거', (done) => {
            baseRepository.remove({writerId});
            done();
        });
    });
    describe('언어별 값 유효성 확인', function () {
        let dollarRate = 0;
        let yuanRate = 0;
        let korProducts: PublishedProductListItemDTO[] = [];
        before('상품 정보 세팅', async () => {
            await Promise.all([
                testHelper.generatePublishedProduct(writerId),
                testHelper.generatePublishedProduct(writerId),
                testHelper.generatePublishedProduct(writerId),
            ]);
        });
        before('환율 정보 세팅', async () => {
            dollarRate = queryPublishedProducts.getCurrencyRate('en');
            yuanRate = queryPublishedProducts.getCurrencyRate('cn');
        });
        it('한국어로 상품 리스트 조회시, 한국어로 표기 되어야 함', async () => {
            korProducts = await queryPublishedProducts.run({nationCode: 'ko'});
            korProducts.forEach((product) => {
                chai.assert.isAbove(product.price, 0);
                chai.assert.isTrue(regex.isKoreanLanguageOnly(product.title));
                chai.assert.isTrue(regex.isKoreanLanguageOnly(product.content));
            });
        });
        it('영어로 상품 리스트 조회시, 영어, 달러 단위로 표기 되어야 함', async () => {
            let products = await queryPublishedProducts.run({nationCode: 'en'});
            products.forEach((product, index) => {
                chai.assert.equal(product.price, Number((korProducts[index].price * dollarRate).toFixed(2)));
                chai.assert.isTrue(regex.isEnglishLanguageOnly(product.title));
                chai.assert.isTrue(regex.isEnglishLanguageOnly(product.content));
            });
        });
        it('중국어로 상품 리스트 조회시, 중국어, 위안화 단위로 표기 되어야 함', async () => {
            let products = await queryPublishedProducts.run({nationCode: 'cn'});
            products.forEach((product, index) => {
                chai.assert.equal(product.price, Number((korProducts[index].price * yuanRate).toFixed(2)));
                chai.assert.isTrue(regex.isChineseLanguageOnly(product.title));
                chai.assert.isTrue(regex.isChineseLanguageOnly(product.content));
            });
        });
        after('테스트 상품 제거', (done) => {
            baseRepository.remove({writerId});
            done();
        });
    });
});

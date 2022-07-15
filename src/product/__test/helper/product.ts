import {CreateProductUseCase} from '@application/use-case/writer/create-product';
import {RequestReviewUseCase} from '@application/use-case/writer/request-review';
import {ProductBaseRepository} from '@infrastructure/database/product-base-repository';
import {OkPacket} from 'mysql';
import {UpdateProductByEditorUseCase} from '@application/use-case/editor/update-product';
import {CompleteReviewUseCase} from '@application/use-case/editor/complete-review';
import {RollbackReviewUseCase} from '@application/use-case/editor/rollback-review';
import {ProductByWriterRepository} from '@domain/writer/product-repository';
import {ProductStatus} from '@infrastructure/database/product-schema';
import {IRegexConverter, RegexConverter} from '@lib/regex-converter';

export interface IReviewEventBaseTestHelper {
    addNewProduct(writerId: number): Promise<number>;
    requestReview(writerId: number, productId: number): Promise<void>;
    completeReview(productId: number): Promise<void>;
    rollbackReview(productId: number): Promise<void>;
    updateCommissionRate(productId: number): Promise<void>;
    removeProduct(productId: number): Promise<OkPacket>;
    generateReviewRequestProduct(productId: number): Promise<number>;
    generatePublishedProduct(productId: number): Promise<void>;
}

export class ProductTestHelper implements IReviewEventBaseTestHelper {
    regexConverter: IRegexConverter;
    constructor() {
        this.regexConverter = new RegexConverter();
    }
    requestReview(writerId: number, productId: number): Promise<void> {
        const requestReviewUseCase = new RequestReviewUseCase();
        return requestReviewUseCase.run({writerId, productId});
    }
    completeReview(productId: number): Promise<void> {
        const completeReviewUseCase = new CompleteReviewUseCase();
        return completeReviewUseCase.run({productId});
    }

    rollbackReview(productId: number): Promise<void> {
        const rollbackReviewUseCase = new RollbackReviewUseCase();
        return rollbackReviewUseCase.run({productId});
    }

    updateCommissionRate(productId: number): Promise<void> {
        const updateProductByEditorUseCase = new UpdateProductByEditorUseCase();
        const commissionRate = 12;
        return updateProductByEditorUseCase.run({productId, commissionRate});
    }
    removeProduct(productId: number) {
        const baseRepository = new ProductBaseRepository();
        return baseRepository.remove({productId});
    }
    addNewProduct(writerId: number): Promise<number> {
        const createProductUseCase = new CreateProductUseCase();
        const title = '신규 상품 제목1';
        const content = '신규 상품 콘텐츠2';
        const price = 100000;
        const props = {writerId, title, content, price};
        return createProductUseCase.run(props);
    }
    async generateReviewRequestProduct(writerId: number): Promise<number> {
        const productByWriterRepository = new ProductByWriterRepository();
        const random = Math.floor(Math.random() * 1000);
        const title = '신규 상품 제목 ' + random;
        const content = '신규 상품 콘텐츠 ' + random;
        const price = 100000 + random * 10;
        const reviewRequestedAt = this.regexConverter.escapeTZCharacter(new Date().toISOString());
        const status = ProductStatus.REVIEW_REQUESTED;
        const props = {writerId, title, content, price, status};
        const response = await productByWriterRepository.createProduct(props);
        await productByWriterRepository.requestReview({productId: response.insertId, status, reviewRequestedAt});
        return response.insertId;
    }
    async generatePublishedProduct(writerId: number): Promise<void> {
        const productId = await this.generateReviewRequestProduct(writerId);
        const completeReviewUseCase = new CompleteReviewUseCase();
        const updateProductByEditorUseCase = new UpdateProductByEditorUseCase();
        const commissionRate = 10;
        const status = ProductStatus.INITIALIZED;
        const props = {productId, commissionRate, status};
        await updateProductByEditorUseCase.run(props);
        return completeReviewUseCase.run({productId});
    }
}

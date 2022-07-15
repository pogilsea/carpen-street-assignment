import {ProductStatus} from '@infrastructure/database/product-schema';
import {IRegexConverter, RegexConverter} from '@lib/regex-converter';
import {ErrorCode} from '@lib/http/error-code';
import createHttpError from 'http-errors';
import {HttpStatus} from '@lib/http/status-code';

export type UpdateProductByEditorProps = {productId: number} & Partial<{
    title: string;
    content: string;
    price: number;
    commissionRate: number;
}>;

export type CompleteReviewProps = {
    productId: number;
    titleEn: string;
    contentEn: string;
    titleCn: string;
    contentCn: string;
};

export type UpdateProductByEditor = UpdateProductByEditorProps & {updatedAt: string};
export type CompleteReview = {
    productId: number;
    titleEn: string;
    contentEn: string;
    titleCn: string;
    contentCn: string;
    status: ProductStatus;
    publishedAt: string;
};
export type RollbackReview = {productId: number; status: ProductStatus};

export interface IProductByEditor {
    updateByEditor(props: UpdateProductByEditorProps): UpdateProductByEditor;
    completeReview(props: CompleteReviewProps): CompleteReview;
    rollbackReview(productId: number): RollbackReview;
    assertExistProduct(product: any): void;
    assertProductEditable(status: ProductStatus): void;
    assertProductCompleteReviewable(status: ProductStatus): void;
    assertProductAlreadyCompleteReview(status: ProductStatus): void;
    assertProductRollbackReview(status: ProductStatus): void;
    assertProductKoreanLetter(title?: string, content?: string): void;
}

export class ProductByEditor implements IProductByEditor {
    protected regexConverter: IRegexConverter;
    constructor() {
        this.regexConverter = new RegexConverter();
    }
    updateByEditor(props: UpdateProductByEditorProps) {
        const updatedAt = this.regexConverter.escapeTZCharacter(new Date().toISOString());
        return {...props, updatedAt};
    }
    rollbackReview(productId: number) {
        return {productId, status: ProductStatus.INITIALIZED};
    }
    completeReview(props: CompleteReviewProps) {
        const publishedAt = this.regexConverter.escapeTZCharacter(new Date().toISOString());
        return {...props, status: ProductStatus.PUBLISHED, publishedAt};
    }
    assertExistProduct(product: any) {
        const errorMessage = `This requested product is gone. not available anymore.`;
        const errorCode = ErrorCode.DATA_NOT_EXIST_IN_STORAGE;
        if (!product) {
            throw createHttpError(HttpStatus.GONE, {errorCode, errorMessage});
        }
    }
    assertProductEditable(status: ProductStatus) {
        const errorMessage = `Invalid current product status for update product. Accepted current status value is: ${ProductStatus.REVIEW_REQUESTED}.`;
        const errorCode = ErrorCode.PRODUCT_STATUS_NOT_EDITABLE;
        if (status !== ProductStatus.REVIEW_REQUESTED) {
            throw createHttpError(HttpStatus.BAD_REQUEST, {errorCode, errorMessage});
        }
    }
    assertProductAlreadyCompleteReview(status: ProductStatus) {
        const errorCode = ErrorCode.PRODUCT_STATUS_ALREADY_CONFIRMED;
        const errorMessage = `Product status is already completed review(current status: ${ProductStatus.PUBLISHED}). Accepted current status value is: ${ProductStatus.REVIEW_REQUESTED}.`;
        if (status === ProductStatus.PUBLISHED) {
            throw createHttpError(HttpStatus.BAD_REQUEST, {errorCode, errorMessage});
        }
    }
    assertProductCompleteReviewable(status: ProductStatus) {
        const errorMessage = `Invalid current product status for complete review. Accepted current status value is: ${ProductStatus.REVIEW_REQUESTED}.`;
        const errorCode = ErrorCode.PRODUCT_STATUS_NOT_EDITABLE;
        if (status !== ProductStatus.REVIEW_REQUESTED) {
            throw createHttpError(HttpStatus.BAD_REQUEST, {errorCode, errorMessage});
        }
    }
    assertProductRollbackReview(status: ProductStatus) {
        const errorMessage = `Invalid current product status for rollback editable to writer. Accepted current status value is: ${ProductStatus.REVIEW_REQUESTED}.`;
        const errorCode = ErrorCode.PRODUCT_STATUS_NOT_CONFIRM_EDITABLE;
        if (status !== ProductStatus.REVIEW_REQUESTED) {
            throw createHttpError(HttpStatus.BAD_REQUEST, {errorCode, errorMessage});
        }
    }
    assertProductKoreanLetter(title?: string, content?: string) {
        const errorCode = ErrorCode.PRODUCT_NOT_KOREAN_LETTER;
        if (!this.regexConverter.isKoreanLanguageOnly(title)) {
            const errorMessage = 'Invalid letter for title. only allowed to letter is korean';
            throw createHttpError(HttpStatus.BAD_REQUEST, {errorCode, errorMessage});
        }
        if (!this.regexConverter.isKoreanLanguageOnly(content)) {
            const errorMessage = 'Invalid letter for content. only allowed to letter is korean';
            throw createHttpError(HttpStatus.BAD_REQUEST, {errorCode, errorMessage});
        }
    }
}

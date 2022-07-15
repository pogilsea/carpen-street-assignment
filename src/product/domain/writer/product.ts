import {ProductStatus} from '@infrastructure/database/product-schema';
import {ErrorCode} from '@lib/http/error-code';
import createHttpError from 'http-errors';
import {HttpStatus} from '@lib/http/status-code';
import {IRegexConverter, RegexConverter} from '@lib/regex-converter';

export type CreateProductProps = {
    writerId: number;
    title: string;
    content: string;
    price: number;
};
export type UpdateProductByWriterProps = {productId: number} & Partial<{
    title: string;
    content: string;
    price: number;
}>;

export type CreateProduct = CreateProductProps & {status: ProductStatus};
export type UpdateProductByWriter = UpdateProductByWriterProps & {updatedAt: string};
export type RequestReview = {productId: number; status: ProductStatus; reviewRequestedAt: string};
export type RequestEditable = {productId: number; status: ProductStatus};

export interface IProductByWriter {
    create(props: CreateProductProps): CreateProduct;
    updateByWriter(props: UpdateProductByWriterProps): UpdateProductByWriter;
    requestReview(productId: number): RequestReview;
    assertExistProduct(product: any): void;
    assertProductKoreanLetter(title?: string, content?: string): void;
    assertProductNotEditable(status: ProductStatus): void;
    assertProductHasRequestedReview(status: ProductStatus): void;
}

export class ProductByWriter implements IProductByWriter {
    protected regexConverter: IRegexConverter;
    constructor() {
        this.regexConverter = new RegexConverter();
    }
    create(props: CreateProductProps) {
        return {...props, status: ProductStatus.INITIALIZED};
    }
    updateByWriter(props: UpdateProductByWriterProps) {
        const updatedAt = this.regexConverter.escapeTZCharacter(new Date().toISOString());
        return {...props, updatedAt};
    }
    requestReview(productId: number) {
        const reviewRequestedAt = this.regexConverter.escapeTZCharacter(new Date().toISOString());
        return {productId, status: ProductStatus.REVIEW_REQUESTED, reviewRequestedAt};
    }
    assertExistProduct(product: any) {
        const errorMessage = 'This requested product is gone. not available anymore.';
        const errorCode = ErrorCode.DATA_NOT_EXIST_IN_STORAGE;
        if (!product) {
            throw createHttpError(HttpStatus.GONE, {errorCode, errorMessage});
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
    assertProductNotEditable(status: ProductStatus) {
        const errorMessage = `Invalid current product status for edit product. Accepted current status value is: ${ProductStatus.INITIALIZED}.`;
        const errorCode = ErrorCode.PRODUCT_STATUS_NOT_EDITABLE;
        if (status !== ProductStatus.INITIALIZED) {
            throw createHttpError(HttpStatus.BAD_REQUEST, {errorCode, errorMessage});
        }
    }

    assertProductHasRequestedReview(status: ProductStatus) {
        const errorMessage = `Product status is already requested review(current status: ${ProductStatus.REVIEW_REQUESTED}). Accepted current status value is: ${ProductStatus.INITIALIZED}, ${ProductStatus.PUBLISHED}.`;
        const errorCode = ErrorCode.PRODUCT_STATUS_ALREADY_REQUESTED_REVIEW;
        if (status === ProductStatus.REVIEW_REQUESTED) {
            throw createHttpError(HttpStatus.BAD_REQUEST, {errorCode, errorMessage});
        }
    }
}

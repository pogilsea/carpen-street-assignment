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

export type UpdateProductByEditor = UpdateProductByEditorProps & {updatedAt: string};
export type CompleteReview = {productId: number; status: ProductStatus; publishedAt: string};
export type ConfirmEditable = {productId: number; status: ProductStatus};

export interface IProductByEditor {
    updateByEditor(props: UpdateProductByEditorProps): UpdateProductByEditor;
    completeReview(productId: number): CompleteReview;
    confirmEditable(productId: number): ConfirmEditable;
    assertExistProduct(product: any): void;
    assertProductEditable(status: ProductStatus): void;
    assertProductCompleteReviewable(status: ProductStatus): void;
    assertProductConfirmEditable(status: ProductStatus): void;
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
    confirmEditable(productId: number) {
        return {productId, status: ProductStatus.INITIALIZED};
    }
    completeReview(productId: number) {
        const publishedAt = this.regexConverter.escapeTZCharacter(new Date().toISOString());
        return {productId, status: ProductStatus.PUBLISHED, publishedAt};
    }
    assertExistProduct(product: any) {
        const errorMessage = '';
        const errorCode = ErrorCode.DATA_NOT_EXIST_IN_STORAGE;
        if (!product) {
            throw createHttpError(HttpStatus.GONE, {errorCode, errorMessage});
        }
    }
    assertProductEditable(status: ProductStatus) {
        const errorMessage = '';
        const errorCode = ErrorCode.PRODUCT_STATUS_NOT_EDITABLE;
        if (status !== ProductStatus.REVIEW_REQUESTED && status !== ProductStatus.EDIT_REQUESTED) {
            throw createHttpError(HttpStatus.BAD_REQUEST, {errorCode, errorMessage});
        }
    }
    assertProductCompleteReviewable(status: ProductStatus) {
        const errorMessage = '';
        const errorCode = ErrorCode.PRODUCT_STATUS_NOT_EDITABLE;
        if (status !== ProductStatus.EDIT_REQUESTED) {
            throw createHttpError(HttpStatus.BAD_REQUEST, {errorCode, errorMessage});
        }
    }
    assertProductConfirmEditable(status: ProductStatus) {
        const errorMessage = '';
        const errorCode = ErrorCode.PRODUCT_STATUS_NOT_EDITABLE;
        if (status !== ProductStatus.EDIT_REQUESTED) {
            throw createHttpError(HttpStatus.BAD_REQUEST, {errorCode, errorMessage});
        }
    }
}

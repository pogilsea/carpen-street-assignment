import {ProductStatus} from '@infrastructure/database/product-schema';
import {ErrorCode} from '@lib/http/error-code';
import createHttpError from 'http-errors';
import {HttpStatus} from '@lib/http/status-code';

export type CreateProductProps = {
    editorId: number;
    title: string;
    content: string;
    price: number;
};
export type UpdateProductByWriterProps = {
    productId: number;
    title: string;
    content: string;
    price: number;
};

export type CreateProduct = CreateProductProps & {status: ProductStatus; commissionRate: number | null; updatedAt: string | null};
export type UpdateProductByWriter = UpdateProductByWriterProps & {updatedAt: string};
export type RequestReview = {productId: number; status: ProductStatus; reviewRequestedAt: string};
export type RequestEditable = {productId: number; status: ProductStatus};

export interface IProductByWriter {
    create(props: CreateProductProps): CreateProduct;
    updateByWriter(props: UpdateProductByWriterProps): UpdateProductByWriter;
    requestReview(productId: number): RequestReview;
    requestEditable(productId: number): RequestEditable;
    assertExistProduct(product: any): void;
    assertProductNotEditable(status: ProductStatus): void;
    assertProductRequestEditable(status: ProductStatus): void;
    assertProductRequestReviewable(status: ProductStatus): void;
}

export class ProductByWriter implements IProductByWriter {
    create(props: CreateProductProps) {
        return {...props, status: ProductStatus.INITIALIZED, commissionRate: null, updatedAt: null};
    }
    updateByWriter(props: UpdateProductByWriterProps) {
        const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        return {...props, updatedAt};
    }
    requestReview(productId: number) {
        const reviewRequestedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        return {productId, status: ProductStatus.REVIEW_REQUESTED, reviewRequestedAt};
    }
    requestEditable(productId: number) {
        return {productId, status: ProductStatus.EDIT_REQUESTED};
    }
    assertExistProduct(product: any) {
        const errorMessage = '';
        const errorCode = ErrorCode.DATA_NOT_EXIST_IN_STORAGE;
        if (!product) {
            throw createHttpError(HttpStatus.GONE, {errorCode, errorMessage});
        }
    }
    assertProductNotEditable(status: ProductStatus) {
        const errorMessage = '[ERROR] 요청 상품은 수정 가능하지 않습니다.';
        const errorCode = ErrorCode.PRODUCT_STATUS_NOT_EDITABLE;
        if (status !== ProductStatus.INITIALIZED) {
            throw createHttpError(HttpStatus.BAD_REQUEST, {errorCode, errorMessage});
        }
    }
    assertProductRequestEditable(status: ProductStatus) {
        const errorMessage = '[ERROR] 검토가 완료된 상품만 수정 요청이 가능합니다.';
        const errorCode = ErrorCode.PRODUCT_STATUS_NOT_REQUEST_EDITABLE;
        if (status !== ProductStatus.PUBLISHED) {
            throw createHttpError(HttpStatus.BAD_REQUEST, {errorCode, errorMessage});
        }
    }
    assertProductRequestReviewable(status: ProductStatus) {
        const errorMessage = '[ERROR] 요청 상품은 리뷰 요청이 가능하지 않습니다.';
        const errorCode = ErrorCode.PRODUCT_STATUS_NOT_CONFIRMED;
        if (status !== ProductStatus.PUBLISHED) {
            throw createHttpError(HttpStatus.BAD_REQUEST, {errorCode, errorMessage});
        }
    }
}

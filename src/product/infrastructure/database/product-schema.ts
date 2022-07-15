export type ProductTableKeyType = {
    productId: number;
    writerId: number;
    status: ProductStatus;
};
export type ProductTableSchemaType = ProductTableSchemaNonNullable & ProductTableSchemaNullable;

type ProductTableSchemaNonNullable = {
    id: number;
    writerId: number;
    title: string;
    content: string;
    price: number;
    status: ProductStatus;
    createdAt: string;
};
type ProductTableSchemaNullableType = {
    titleEn: string;
    titleCn: string;
    contentEn: string;
    contentCn: string;
    commissionRate: number;
    reviewRequestedAt: string;
    publishedAt: string;
    updatedAt: string;
};

type ProductTableSchemaNullable = {
    [K in keyof ProductTableSchemaNullableType]?: ProductTableSchemaNullableType[K] | null;
};

export enum ProductStatus {
    INITIALIZED = 'INITIALIZED',
    REVIEW_REQUESTED = 'REVIEW_REQUESTED',
    PUBLISHED = 'PUBLISHED',
}

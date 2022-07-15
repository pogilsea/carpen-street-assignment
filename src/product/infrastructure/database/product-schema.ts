export type ProductTableKeyType = {
    productId: number;
    editorId: number;
    status: ProductStatus;
};
export type ProductTableSchemaType = {
    id: number;
    editorId: number;
    title: string;
    content: string;
    price: number;
    status: ProductStatus;
    commissionRate: number | null;
    createdAt: string;
    updatedAt: string | null;
};

export enum ProductStatus {
    INITIALIZED = 'INITIALIZED',
    REVIEW_REQUESTED = 'REVIEW_REQUESTED',
    PUBLISHED = 'PUBLISHED',
    EDIT_REQUESTED = 'EDIT_REQUESTED',
}

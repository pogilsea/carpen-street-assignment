import {IBaseValidator, Validator} from '@lib/http/validator';
import {IProductByEditorRepository} from '@domain/editor/product-model';
import {ProductByEditorRepository} from '@domain/editor/product-repository';
import {IProductByEditor, ProductByEditor} from '@domain/editor/product';
import {ProductStatus} from '@infrastructure/database/product-schema';

export type RollbackReviewDTO = {
    productId: number;
};
export class RollbackReviewUseCase {
    protected product: IProductByEditor;
    protected repository: IProductByEditorRepository;
    protected validator: IBaseValidator;
    constructor() {
        this.product = new ProductByEditor();
        this.repository = new ProductByEditorRepository();
        this.validator = new Validator();
    }

    async run(param: RollbackReviewDTO) {
        const {productId} = param;
        this.validator.execute(DTOValidation, param);
        const product = await this.repository.readOne<{status: ProductStatus}>({productId}, {fields: ['status']});
        this.product.assertExistProduct(product);
        this.product.assertProductRollbackReview(product.status);
        const data = this.product.rollbackReview(productId);
        await this.repository.rollbackReview(data);
    }
}
const DTOValidation = {
    type: 'object',
    additionalProperties: false,
    required: ['productId'],
    properties: {
        writerId: {type: 'number', minimum: 1},
        productId: {type: 'number', minimum: 1},
    },
};

import {IBaseValidator, Validator} from '@lib/http/validator';
import {IProductByEditorRepository} from '@domain/editor/product-model';
import {ProductByEditorRepository} from '@domain/editor/product-repository';
import {IProductByEditor, ProductByEditor} from '@domain/editor/product';
import {ProductStatus} from '@infrastructure/database/product-schema';

export type UpdateProductByEditorDTO = {productId: number} & Partial<{
    title: string;
    content: string;
    price: number;
    commissionRate: number;
}>;
export class UpdateProductByEditorUseCase {
    protected product: IProductByEditor;
    protected repository: IProductByEditorRepository;
    protected validator: IBaseValidator;
    constructor() {
        this.product = new ProductByEditor();
        this.repository = new ProductByEditorRepository();
        this.validator = new Validator();
    }

    async run(param: UpdateProductByEditorDTO) {
        const {productId, title, content} = param;
        this.validator.execute(DTOValidation, param);
        this.product.assertProductKoreanLetter(title, content);
        const product = await this.repository.readOne<{status: ProductStatus}>({productId}, {fields: ['status']});
        this.product.assertExistProduct(product);
        this.product.assertProductEditable(product.status);
        const data = this.product.updateByEditor(param);
        await this.repository.updateProductByEditor(data);
    }
}
const DTOValidation = {
    type: 'object',
    additionalProperties: false,
    required: ['productId'],
    properties: {
        productId: {type: 'number', minimum: 1},
        title: {type: 'string', minLength: 1},
        content: {type: 'string', minLength: 1},
        price: {type: 'number', minimum: 1},
        commissionRate: {type: 'number', minimum: 0},
    },
};

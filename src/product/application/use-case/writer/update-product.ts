import {IBaseValidator, Validator} from '@lib/http/validator';
import {IProductByWriterRepository} from '@domain/writer/product-model';
import {ProductByWriterRepository} from '@domain/writer/product-repository';
import {IProductByWriter, ProductByWriter} from '@domain/writer/product';
import {ProductStatus} from '@infrastructure/database/product-schema';

export type UpdateProductByWriterDTO = {writerId: number; productId: number} & Partial<{
    title: string;
    content: string;
    price: number;
}>;
export class UpdateProductByWriterUseCase {
    protected product: IProductByWriter;
    protected repository: IProductByWriterRepository;
    protected validator: IBaseValidator;
    constructor() {
        this.product = new ProductByWriter();
        this.repository = new ProductByWriterRepository();
        this.validator = new Validator();
    }

    async run(param: UpdateProductByWriterDTO) {
        const {writerId, productId, title, content} = param;
        console.log('param', param);
        this.validator.execute(DTOValidation, param);
        this.product.assertProductKoreanLetter(title, content);
        const product = await this.repository.readOne<{status: ProductStatus}>({writerId, productId}, {fields: ['status']});
        this.product.assertExistProduct(product);
        this.product.assertProductNotEditable(product.status);
        const data = this.product.updateByWriter(param);
        await this.repository.updateProductByWriter(data);
    }
}
const DTOValidation = {
    type: 'object',
    additionalProperties: false,
    required: ['productId', 'writerId'],
    properties: {
        title: {type: 'string', minLength: 1},
        content: {type: 'string', minLength: 1},
        writerId: {type: 'number', minimum: 1},
        productId: {type: 'number', minimum: 1},
        price: {type: 'number', minimum: 1},
    },
};

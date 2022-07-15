import {IBaseValidator, Validator} from '@lib/http/validator';
import {ProductByWriterRepository} from '@domain/writer/product-repository';
import {IProductByWriter, ProductByWriter} from '@domain/writer/product';
import {IProductByWriterRepository} from '@domain/writer/product-model';

export interface ICreateProductUseCase {
    run(param: CreateProductDTO): Promise<number>;
}

export class CreateProductUseCase implements ICreateProductUseCase {
    protected product: IProductByWriter;
    protected repository: IProductByWriterRepository;
    protected validator: IBaseValidator;
    constructor() {
        this.product = new ProductByWriter();
        this.repository = new ProductByWriterRepository();
        this.validator = new Validator();
    }

    run = async (param: CreateProductDTO) => {
        const {content, title} = param;
        this.validator.execute(DTOValidation, param);
        this.product.assertProductKoreanLetter(title, content);
        const data = this.product.create(param);
        let {insertId} = await this.repository.createProduct(data);
        return insertId;
    };
}

export type CreateProductDTO = {
    writerId: number;
    title: string;
    content: string;
    price: number;
};

const DTOValidation = {
    type: 'object',
    additionalProperties: false,
    required: ['title', 'content', 'writerId', 'price'],
    properties: {
        title: {type: 'string', minLength: 1},
        content: {type: 'string', minLength: 1},
        writerId: {type: 'number', minimum: 1},
        price: {type: 'number', minimum: 1},
    },
};

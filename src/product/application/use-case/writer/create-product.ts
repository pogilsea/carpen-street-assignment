import {IBaseValidator, Validator} from '@lib/http/validator';
import {ProductByWriterRepository} from '@domain/writer/product-repository';
import {IProductByWriter, ProductByWriter} from '@domain/writer/product';
import {IProductByWriterRepository} from '@domain/writer/product-model';

export class CreateProductUseCase {
    protected product: IProductByWriter;
    protected repository: IProductByWriterRepository;
    protected validator: IBaseValidator;
    constructor() {
        this.product = new ProductByWriter();
        this.repository = new ProductByWriterRepository();
        this.validator = new Validator();
    }

    async main(param: CreateProductDTO) {
        //validation
        this.validator.execute(DTOValidation, param);
        // 디비 저장용 데이터 변환
        const data = this.product.create(param);
        // 데이터 저장
        let {insertId} = await this.repository.createProduct(data);
        return insertId;
    }
}

export type CreateProductDTO = {
    editorId: number;
    title: string;
    content: string;
    price: number;
};

const DTOValidation = {
    type: 'object',
    additionalProperties: false,
    required: ['title', 'content', 'editorId', 'price'],
    properties: {
        title: {type: 'string', minLength: 1},
        content: {type: 'string', minLength: 1},
        editorId: {type: 'number', minLength: 1},
        price: {type: 'number', minLength: 1},
    },
};

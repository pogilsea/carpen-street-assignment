import {IBaseValidator, Validator} from '@lib/http/validator';
import {IProductByWriterRepository} from '@domain/writer/product-model';
import {ProductByWriterRepository} from '@domain/writer/product-repository';
import {IProductByWriter, ProductByWriter} from '@domain/writer/product';
import {ProductStatus} from '@infrastructure/database/product-schema';

export type UpdateProductByWriterDTO = {
    editorId: number;
    productId: number;
    title: string;
    content: string;
    price: number;
};
export class UpdateProductByWriterUseCase {
    protected product: IProductByWriter;
    protected repository: IProductByWriterRepository;
    protected validator: IBaseValidator;
    constructor() {
        this.product = new ProductByWriter();
        this.repository = new ProductByWriterRepository();
        this.validator = new Validator();
    }

    async main(param: UpdateProductByWriterDTO) {
        const {editorId, productId} = param;
        //리퀘스트 파라미터 유효성 검사
        this.validator.execute(DTOValidation, param);
        const product = await this.repository.readOne<{status: ProductStatus}>({editorId, productId}, {fields: ['status']});
        // 상품 정보 존재 확인
        this.product.assertExistProduct(product);
        // 상품 검증 요청 가능 상태 확인
        this.product.assertProductNotEditable(product.status);
        // 디비 저장용 데이터 변환
        const data = this.product.updateByWriter(param);
        // 데이터 저장
        await this.repository.updateProductByWriter(data);
    }
}
const DTOValidation = {
    type: 'object',
    additionalProperties: false,
    required: ['productId', 'editorId'],
    properties: {
        title: {type: 'string', minLength: 1},
        content: {type: 'string', minLength: 1},
        editorId: {type: 'number', minLength: 1},
        productId: {type: 'number', minLength: 1},
        price: {type: 'number', minLength: 1},
    },
};

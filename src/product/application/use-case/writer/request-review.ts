import {IBaseValidator, Validator} from '@lib/http/validator';
import {IProductByWriterRepository} from '@domain/writer/product-model';
import {ProductByWriterRepository} from '@domain/writer/product-repository';
import {IProductByWriter, ProductByWriter} from '@domain/writer/product';
import {ProductStatus} from '@infrastructure/database/product-schema';

export type RequestReviewDTO = {
    writerId: number;
    productId: number;
};
export class RequestReviewUseCase {
    protected product: IProductByWriter;
    protected repository: IProductByWriterRepository;
    protected validator: IBaseValidator;
    constructor() {
        this.product = new ProductByWriter();
        this.repository = new ProductByWriterRepository();
        this.validator = new Validator();
    }

    async run(param: RequestReviewDTO) {
        const {writerId, productId} = param;
        //리퀘스트 파라미터 유효성 검사
        this.validator.execute(DTOValidation, param);
        const product = await this.repository.readOne<{status: ProductStatus}>({writerId, productId}, {fields: ['status']});
        // 상품 정보 존재 확인
        this.product.assertExistProduct(product);
        // 상품 검증 요청 가능 상태 확인
        this.product.assertProductHasRequestedReview(product.status);
        // 디비 저장용 데이터 변환
        const data = this.product.requestReview(productId);
        // 데이터 저장
        await this.repository.requestReview(data);
    }
}
const DTOValidation = {
    type: 'object',
    additionalProperties: false,
    required: ['writerId', 'productId'],
    properties: {
        writerId: {type: 'number', minimum: 1},
        productId: {type: 'number', minimum: 1},
    },
};

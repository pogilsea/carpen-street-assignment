import {IBaseValidator, Validator} from '@lib/http/validator';
import {IProductByEditorRepository} from '@domain/editor/product-model';
import {ProductByEditorRepository} from '@domain/editor/product-repository';
import {IProductByEditor, ProductByEditor} from '@domain/editor/product';
import {ProductStatus} from '@infrastructure/database/product-schema';

export type CompleteReviewDTO = {
    productId: number;
};
export class CompleteReviewUseCase {
    protected product: IProductByEditor;
    protected repository: IProductByEditorRepository;
    protected validator: IBaseValidator;
    constructor() {
        this.product = new ProductByEditor();
        this.repository = new ProductByEditorRepository();
        this.validator = new Validator();
    }

    async main(param: CompleteReviewDTO) {
        const {productId} = param;
        //리퀘스트 파라미터 유효성 검사
        this.validator.execute(DTOValidation, param);
        const product = await this.repository.readOne<{status: ProductStatus}>({productId}, {fields: ['status']});
        // 상품 정보 존재 확인
        this.product.assertExistProduct(product);
        // 상품 검증 요청 가능 상태 확인
        this.product.assertProductCompleteReviewable(product.status);
        // 디비 저장용 데이터 변환
        const data = this.product.completeReview(productId);
        // 데이터 저장
        await this.repository.completeReview(data);
    }
}
const DTOValidation = {
    type: 'object',
    additionalProperties: false,
    required: ['editorId', 'productId'],
    properties: {
        editorId: {type: 'number', minLength: 1},
        productId: {type: 'number', minLength: 1},
    },
};

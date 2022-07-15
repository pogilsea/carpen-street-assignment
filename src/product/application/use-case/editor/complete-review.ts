import {IBaseValidator, Validator} from '@lib/http/validator';
import {IProductByEditorRepository} from '@domain/editor/product-model';
import {ProductByEditorRepository} from '@domain/editor/product-repository';
import {IProductByEditor, ProductByEditor} from '@domain/editor/product';
import {ProductStatus} from '@infrastructure/database/product-schema';
import {IPapagoTranslator, PapagoTranslator} from '@infrastructure/external-api/papago-translator';

export type CompleteReviewDTO = {
    productId: number;
};
export class CompleteReviewUseCase {
    protected product: IProductByEditor;
    protected repository: IProductByEditorRepository;
    protected validator: IBaseValidator;
    protected translator: IPapagoTranslator;
    constructor() {
        this.product = new ProductByEditor();
        this.translator = new PapagoTranslator();
        this.repository = new ProductByEditorRepository();
        this.validator = new Validator();
    }

    async run(param: CompleteReviewDTO) {
        const {productId} = param;
        //리퀘스트 파라미터 유효성 검사
        this.validator.execute(DTOValidation, param);
        const product = await this.repository.readOne<{status: ProductStatus; title: string; content: string}>(
            {productId},
            {fields: ['status', 'title', 'content']},
        );
        this.product.assertExistProduct(product);
        this.product.assertProductCompleteReviewable(product.status);
        this.product.assertProductAlreadyCompleteReview(product.status);
        // 디비 저장용 데이터 변환
        const [titleCn, contentCn, titleEn, contentEn] = await Promise.all([
            this.translator.translateToChinese(product.title),
            this.translator.translateToChinese(product.content),
            this.translator.translateToEnglish(product.title),
            this.translator.translateToEnglish(product.content),
        ]);
        const data = this.product.completeReview({productId, titleCn, contentCn, titleEn, contentEn});
        // 데이터 저장
        await this.repository.completeReview(data);
    }
}
const DTOValidation = {
    type: 'object',
    additionalProperties: false,
    required: ['productId'],
    properties: {
        productId: {type: 'number', minimum: 1},
    },
};

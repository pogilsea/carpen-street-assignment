import {IBaseValidator, Validator} from '@lib/http/validator';
import {ProductStatus} from '@infrastructure/database/product-schema';
import {ProductBaseRepository} from '@infrastructure/database/product-base-repository';
import {IProductBaseRepository} from '@infrastructure/database/product-base-repository-model';

export type RequestToEditorProductFromDB = Readonly<{
    id: number;
    title: string;
    status: ProductStatus;
    content: number;
    price: number;
    commissionRate: number;
    createdAt: string;
}>;
export type QueryRequestToEditorProductListItemDTO = Readonly<{
    id: number;
    title: string;
    content: number;
    price: number;
    status: string;
    commissionRate: number | null;
    commissionAmount: number;
    createdAt: string;
}>;

export class QueryRequestToEditorProducts {
    protected repository: IProductBaseRepository;
    protected validator: IBaseValidator;
    constructor() {
        this.repository = new ProductBaseRepository();
        this.validator = new Validator();
    }

    async main() {
        const fields = this.getFields();
        const statusReview = ProductStatus.REVIEW_REQUESTED;
        const statusEdit = ProductStatus.REVIEW_REQUESTED;
        const requestReviews = await this.repository.read<RequestToEditorProductFromDB>({status: statusReview}, {fields});
        const requestEdits = await this.repository.read<RequestToEditorProductFromDB>({status: statusEdit}, {fields});
        return this.getViewModelList(requestReviews.concat(requestEdits));
    }
    getFields() {
        return ['id', 'price', 'title', 'content', 'status', 'commissionRate', 'createdAt'];
    }
    getViewModelList = (response: RequestToEditorProductFromDB[]): QueryRequestToEditorProductListItemDTO[] => {
        return response.map((item) => {
            let {commissionRate, price, status, ...rest} = item;
            commissionRate = commissionRate || 0;
            const calculatedAmount = price * commissionRate;
            let statusText = this.getStatusText(status);
            return {...rest, price, commissionRate, status: statusText, commissionAmount: calculatedAmount};
        });
    };
    getStatusText(status: ProductStatus) {
        switch (status) {
            case ProductStatus.INITIALIZED:
                return '작성중';
            case ProductStatus.REVIEW_REQUESTED:
                return '검토요청';
            case ProductStatus.EDIT_REQUESTED:
                return '수정요청';
            case ProductStatus.PUBLISHED:
                return '검토완료';
        }
    }
}

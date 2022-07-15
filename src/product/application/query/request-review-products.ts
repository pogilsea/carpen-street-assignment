import {IBaseValidator, Validator} from '@lib/http/validator';
import {ProductStatus} from '@infrastructure/database/product-schema';
import {ProductBaseRepository} from '@infrastructure/database/product-base-repository';
import {IProductBaseRepository} from '@infrastructure/database/product-base-repository-model';

export type RequestReviewProductFromDB = Readonly<{
    id: number;
    title: string;
    status: ProductStatus;
    content: string;
    price: number;
    commissionRate: number;
    createdAt: string;
    reviewRequestedAt: string;
}>;
export type QueryRequestReviewProductListItemDTO = Readonly<{
    id: number;
    title: string;
    content: string;
    price: number;
    status: string;
    commissionRate: number | null;
    commissionAmount: number;
    reviewRequestedAt: string;
    createdAt: string;
}>;

export class QueryRequestReviewProducts {
    protected repository: IProductBaseRepository;
    protected validator: IBaseValidator;
    constructor() {
        this.repository = new ProductBaseRepository();
        this.validator = new Validator();
    }

    async run() {
        const fields = this.getFields();
        const statusReview = ProductStatus.REVIEW_REQUESTED;
        const statusEdit = ProductStatus.REVIEW_REQUESTED;
        const requestReviews = await this.repository.read<RequestReviewProductFromDB>({status: statusReview}, {fields});
        const requestEdits = await this.repository.read<RequestReviewProductFromDB>({status: statusEdit}, {fields});
        return this.getViewModelList(requestReviews.concat(requestEdits));
    }
    getFields() {
        return ['id', 'price', 'title', 'content', 'status', 'commissionRate', 'createdAt', 'reviewRequestedAt'];
    }
    getViewModelList = (response: RequestReviewProductFromDB[]): QueryRequestReviewProductListItemDTO[] => {
        return response.map((item) => {
            let {commissionRate, price, ...rest} = item;
            commissionRate = commissionRate || 0;
            const calculatedAmount = price * commissionRate;
            return {...rest, price, commissionRate, commissionAmount: calculatedAmount};
        });
    };
}

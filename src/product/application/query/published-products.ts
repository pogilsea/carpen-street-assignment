import {IBaseValidator, Validator} from '@lib/http/validator';
import {ProductStatus} from '@infrastructure/database/product-schema';
import {ProductBaseRepository} from '@infrastructure/database/product-base-repository';
import {IProductBaseRepository} from '@infrastructure/database/product-base-repository-model';

export type QueryPublishedProductsProps = {
    nationCode?: NationValue;
    filterValue: string;
};
export type PublishedProductFromDB = Readonly<{
    id: number;
    title: string;
    content: number;
    price: number;
    currencyRate: number;
    publishedAt: string;
}>;
export type PublishedProductListItemDTO = Readonly<{
    id: number;
    title: string;
    content: number;
    price: number;
    publishedAt: string;
}>;
type NationValue = 'kor' | 'eng' | 'chn';
export class QueryPublishedProducts {
    protected repository: IProductBaseRepository;
    protected validator: IBaseValidator;
    constructor() {
        this.repository = new ProductBaseRepository();
        this.validator = new Validator();
    }

    async main(props: QueryPublishedProductsProps) {
        const nationCode = props.nationCode || 'kor';
        const fields = this.getFields(nationCode);
        const status = ProductStatus.PUBLISHED;
        const product = await this.repository.read<PublishedProductFromDB>({status}, {fields});
        return this.getViewModelList(product);
    }
    getFields(nation: NationValue) {
        const fields = ['id', 'price', 'publishedAt'];
        if (nation === 'eng') {
            fields.concat(['titleEng as title', 'contentEng as content', 'currencyRateEng as currencyRate']);
        } else if (nation === 'chn') {
            fields.concat(['titleChn as title', 'contentChn as content', 'currencyRateChn as currencyRate']);
        } else {
            fields.concat(['title', 'content', '1 as currencyRate']);
        }
        return fields;
    }
    getViewModelList = (response: PublishedProductFromDB[]): PublishedProductListItemDTO[] => {
        return response.map((item) => {
            const {currencyRate, price, ...rest} = item;
            const calculatedPrice = price * currencyRate;
            return {...rest, price: calculatedPrice};
        });
    };
}

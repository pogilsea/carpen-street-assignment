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

    async run(props: QueryPublishedProductsProps) {
        const nationCode = props.nationCode || 'kor';
        const fields = this.getFields(nationCode);
        const status = ProductStatus.PUBLISHED;
        const currencyRate = this.getCurrencyRate(nationCode);
        const product = await this.repository.read<PublishedProductFromDB>({status}, {fields});
        return this.getViewModelList(product, currencyRate);
    }
    getCurrencyRate(nation: NationValue) {
        if (nation === 'eng') {
            return 0.00075;
        }
        if (nation === 'chn') {
            return 0.0051;
        }
        return 1;
    }
    getFields(nation: NationValue) {
        const fields = ['id', 'price', 'publishedAt'];
        if (nation === 'eng') {
            fields.concat(['titleEng as title', 'contentEng as content']);
        } else if (nation === 'chn') {
            fields.concat(['titleChn as title', 'contentChn as content']);
        } else {
            fields.concat(['title', 'content']);
        }
        return fields;
    }
    getViewModelList = (response: PublishedProductFromDB[], currencyRate: number): PublishedProductListItemDTO[] => {
        return response.map((item) => {
            const {price, ...rest} = item;
            const calculatedPrice = Number((price * currencyRate).toFixed(2));
            return {...rest, price: calculatedPrice};
        });
    };
}

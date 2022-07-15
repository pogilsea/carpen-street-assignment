import {IBaseValidator, Validator} from '@lib/http/validator';
import {ProductStatus} from '@infrastructure/database/product-schema';
import {ProductBaseRepository} from '@infrastructure/database/product-base-repository';
import {IProductBaseRepository} from '@infrastructure/database/product-base-repository-model';

export type QueryPublishedProductsProps = {
    nationCode?: NationValue;
};
export type PublishedProductFromDB = Readonly<{
    id: number;
    title: string;
    content: string;
    price: number;
    publishedAt: string;
}>;
export type PublishedProductListItemDTO = Readonly<{
    id: number;
    title: string;
    content: string;
    price: number;
    publishedAt: string;
}>;
type NationValue = 'ko' | 'en' | 'cn';
export class QueryPublishedProducts {
    protected repository: IProductBaseRepository;
    protected validator: IBaseValidator;
    constructor() {
        this.repository = new ProductBaseRepository();
        this.validator = new Validator();
    }

    async run(props: QueryPublishedProductsProps) {
        const nationCode = props.nationCode || 'ko';
        const fields = this.getFields(nationCode);
        const status = ProductStatus.PUBLISHED;
        const currencyRate = this.getCurrencyRate(nationCode);
        const product = await this.repository.read<PublishedProductFromDB>({status}, {fields});
        return this.getViewModelList(product, currencyRate);
    }
    getCurrencyRate(nation: NationValue) {
        if (nation === 'en') {
            return 0.00075;
        }
        if (nation === 'cn') {
            return 0.0051;
        }
        return 1;
    }
    getFields(nation: NationValue) {
        let fields = ['id', 'price', 'publishedAt'];
        if (nation === 'en') {
            fields = fields.concat(['titleEn as title', 'contentEn as content']);
        } else if (nation === 'cn') {
            fields = fields.concat(['titleCn as title', 'contentCn as content']);
        } else {
            fields = fields.concat(['title', 'content']);
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

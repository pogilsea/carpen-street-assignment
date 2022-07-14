import {IProductByWriterRepository} from '@domain/writer/product-model';
import {CreateProduct, RequestEditable, RequestReview, UpdateProductByWriter} from '@domain/writer/product';
import {ProductBaseRepository} from '@infrastructure/database/product-base-repository';

export class ProductByWriterRepository extends ProductBaseRepository implements IProductByWriterRepository {
    createProduct(props: CreateProduct) {
        return this.insert(props);
    }
    updateProductByWriter(props: UpdateProductByWriter) {
        const {productId, ...data} = props;
        return this.updateOne({productId}, data);
    }
    requestReview(props: RequestReview) {
        const {productId, ...data} = props;
        return this.updateOne({productId}, data);
    }
    requestEditable(props: RequestEditable) {
        const {productId, ...data} = props;
        return this.updateOne({productId}, data);
    }
}

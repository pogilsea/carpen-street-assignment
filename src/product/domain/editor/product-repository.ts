import {ProductBaseRepository} from '@infrastructure/database/product-base-repository';
import {CompleteReview, ConfirmEditable, UpdateProductByEditor} from '@domain/editor/product';
import {IProductByEditorRepository} from '@domain/editor/product-model';

export class ProductByEditorRepository extends ProductBaseRepository implements IProductByEditorRepository {
    updateProductByEditor(props: UpdateProductByEditor) {
        const {productId, ...data} = props;
        return this.updateOne({productId}, data);
    }
    completeReview(props: CompleteReview) {
        const {productId, ...data} = props;
        return this.updateOne({productId}, data);
    }
    confirmEditable(props: ConfirmEditable) {
        const {productId, ...data} = props;
        return this.updateOne({productId}, data);
    }
}

import {OkPacket} from 'mysql';
import {CompleteReview, RollbackReview, UpdateProductByEditor} from '@domain/editor/product';
import {IProductBaseRepository} from '@infrastructure/database/product-base-repository-model';

export interface IProductByEditorRepository extends IProductBaseRepository {
    updateProductByEditor(props: UpdateProductByEditor): Promise<OkPacket>;
    completeReview(props: CompleteReview): Promise<OkPacket>;
    rollbackReview(props: RollbackReview): Promise<OkPacket>;
}

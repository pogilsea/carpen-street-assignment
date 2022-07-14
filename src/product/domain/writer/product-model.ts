import {OkPacket} from 'mysql';
import {CreateProduct, RequestReview, RequestEditable, UpdateProductByWriter} from '@domain/writer/product';
import {IProductBaseRepository} from '@infrastructure/database/product-base-repository-model';

export interface IProductByWriterRepository extends IProductBaseRepository {
    createProduct(props: CreateProduct): Promise<OkPacket>;
    updateProductByWriter(props: UpdateProductByWriter): Promise<OkPacket>;
    requestReview(props: RequestReview): Promise<OkPacket>;
    requestEditable(props: RequestEditable): Promise<OkPacket>;
}

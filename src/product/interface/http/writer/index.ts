import {ProductByWriterRouteHandler} from '@interface/http/writer/router';
import {Router} from 'express';

export class ProductWriterRouter {
    router: Router;
    productRouter = new ProductByWriterRouteHandler();
    constructor() {
        this.router = Router();
        this.setRouter();
    }
    private setRouter() {
        this.router.post('/products', this.productRouter.createProduct.bind(this));
        this.router.patch('/products/request-review/:productId', this.productRouter.requestReview.bind(this));
        this.router.put('/products/writer/:productId', this.productRouter.updateProduct.bind(this));
    }
}

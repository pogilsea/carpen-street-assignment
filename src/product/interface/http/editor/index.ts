import {ProductByEditorRouteHandler} from '@interface/http/editor/router';
import {Router} from 'express';

export class ProductEditorRouter {
    productRouter: ProductByEditorRouteHandler;
    router: Router;
    constructor() {
        this.router = Router();
        this.productRouter = new ProductByEditorRouteHandler();
        this.setRouter();
    }
    private setRouter() {
        this.router.patch('/products/complete-review/:productId', this.productRouter.completeReview.bind(this));
        this.router.patch('/products/rollback-review/:productId', this.productRouter.rollbackReview.bind(this));
        this.router.put('/products/editor/:productId', this.productRouter.updateProduct.bind(this));
        this.router.get('/products/request-review', this.productRouter.readRequestReviewProducts.bind(this));
    }
}

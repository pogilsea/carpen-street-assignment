import {ProductByUserRouteHandler} from '@interface/http/user/router';
import {Router} from 'express';

export class ProductUserRouter {
    productRouter: ProductByUserRouteHandler;
    router: Router;
    constructor() {
        this.router = Router();
        this.productRouter = new ProductByUserRouteHandler();
        this.setRouter();
    }
    private setRouter() {
        this.router.get('/products/published', this.productRouter.queryPublishedProducts.bind(this));
    }
}

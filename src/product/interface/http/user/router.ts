import {NextFunction, Request, Response} from 'express';
import {BaseRouteHandler} from '@lib/http/base-router';
import {QueryPublishedProducts} from '@application/query/published-products';

export class ProductByUserRouteHandler extends BaseRouteHandler {
    queryPublished: QueryPublishedProducts;
    constructor() {
        super();
        this.queryPublished = new QueryPublishedProducts();
    }

    // 검토 완료된 상품 쿼리
    queryPublishedProducts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = this.getQuery(req);
            const products = await this.queryPublished.run(query);
            // HTTP 응답값 처리
            return res.send({responseCode: 200, resultMessage: 'Success', result: {products}});
        } catch (err) {
            return next(err);
        }
    };
}

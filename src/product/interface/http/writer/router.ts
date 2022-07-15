import {NextFunction, Request, Response} from 'express';
import {CreateProductUseCase} from '@application/use-case/writer/create-product';
import {BaseRouteHandler} from '@lib/http/base-router';
import {ROLE} from '@lib/jwt-auth';
import {RequestReviewUseCase} from '@application/use-case/writer/request-review';
import {UpdateProductByWriterUseCase} from '@application/use-case/writer/update-product';

export interface IProductByWriterRouteHandler {
    createProduct(req: Request, res: Response, next: NextFunction): Promise<any>;
    requestReview(req: Request, res: Response, next: NextFunction): Promise<any>;
    updateProduct(req: Request, res: Response, next: NextFunction): Promise<any>;
}

export class ProductByWriterRouteHandler extends BaseRouteHandler implements IProductByWriterRouteHandler {
    createUseCase;
    requestReviewUseCase;
    updateProductUseCase;
    constructor() {
        super();
        this.createUseCase = new CreateProductUseCase();
        this.requestReviewUseCase = new RequestReviewUseCase();
        this.updateProductUseCase = new UpdateProductByWriterUseCase();
    }

    // 상품 등록
    createProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = this.getBody(req);
            const token = await this.getAuthorizedUser(req);
            this.assertAuthorizedUserRole(token, [ROLE.WRITER]);
            const productId = await this.createUseCase.run({...body, writerId: token.id});
            // HTTP 응답값 처리
            return res.send({responseCode: 200, resultMessage: 'Success', result: {productId}});
        } catch (err) {
            return next(err);
        }
    };
    // 검토 요청
    requestReview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const productId = Number(this.getParam(req, 'productId'));
            const token = await this.getAuthorizedUser(req);
            this.assertAuthorizedUserRole(token, [ROLE.WRITER]);
            await this.requestReviewUseCase.run({productId, writerId: token.id});
            // HTTP 응답값 처리
            return res.send({responseCode: 200, resultMessage: 'Success'});
        } catch (err) {
            return next(err);
        }
    };
    // 상품 정보 수정
    updateProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = this.getBody(req);
            const productId = Number(this.getParam(req, 'productId'));
            const token = await this.getAuthorizedUser(req);
            this.assertAuthorizedUserRole(token, [ROLE.WRITER]);
            await this.updateProductUseCase.run({...body, productId, writerId: token.id});
            // HTTP 응답값 처리
            return res.send({responseCode: 200, resultMessage: 'Success'});
        } catch (err) {
            return next(err);
        }
    };
}

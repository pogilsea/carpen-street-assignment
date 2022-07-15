import {NextFunction, Request, Response} from 'express';
import {BaseRouteHandler} from '@lib/http/base-router';
import {ROLE} from '@lib/jwt-auth';
import {UpdateProductByEditorUseCase} from '@application/use-case/editor/update-product';
import {RollbackReviewUseCase} from '@application/use-case/editor/rollback-review';
import {CompleteReviewUseCase} from '@application/use-case/editor/complete-review';
import {QueryRequestReviewProducts} from '@application/query/request-review-products';

export class ProductByEditorRouteHandler extends BaseRouteHandler {
    rollbackReviewUseCase;
    completeReviewUseCase;
    updateProductUseCase;
    queryRequestReviewProducts;
    constructor() {
        super();
        this.rollbackReviewUseCase = new RollbackReviewUseCase();
        this.completeReviewUseCase = new CompleteReviewUseCase();
        this.updateProductUseCase = new UpdateProductByEditorUseCase();
        this.queryRequestReviewProducts = new QueryRequestReviewProducts();
    }

    // 상품 수정 가능 상태로 변경 확인
    rollbackReview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const productId = Number(this.getParam(req, 'productId'));
            const token = await this.getAuthorizedUser(req);
            this.assertAuthorizedUserRole(token, [ROLE.EDITOR]);
            await this.rollbackReviewUseCase.run({productId});
            // HTTP 응답값 처리
            return res.send({responseCode: 200, resultMessage: 'Success'});
        } catch (err) {
            return next(err);
        }
    };
    // 검토 완료
    completeReview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const productId = Number(this.getParam(req, 'productId'));
            const token = await this.getAuthorizedUser(req);
            this.assertAuthorizedUserRole(token, [ROLE.EDITOR]);
            await this.completeReviewUseCase.run({productId});
            // HTTP 응답값 처리
            return res.send({responseCode: 200, resultMessage: 'Success'});
        } catch (err) {
            return next(err);
        }
    };
    // 상품 수정
    updateProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = this.getBody(req);
            const productId = Number(this.getParam(req, 'productId'));
            const token = await this.getAuthorizedUser(req);
            this.assertAuthorizedUserRole(token, [ROLE.EDITOR]);
            await this.updateProductUseCase.run({...body, productId});
            // HTTP 응답값 처리
            return res.send({responseCode: 200, resultMessage: 'Success'});
        } catch (err) {
            return next(err);
        }
    }; // 상품 수정
    readRequestReviewProducts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = await this.getAuthorizedUser(req);
            this.assertAuthorizedUserRole(token, [ROLE.EDITOR]);
            await this.queryRequestReviewProducts.run();
            // HTTP 응답값 처리
            return res.send({responseCode: 200, resultMessage: 'Success'});
        } catch (err) {
            return next(err);
        }
    };
}

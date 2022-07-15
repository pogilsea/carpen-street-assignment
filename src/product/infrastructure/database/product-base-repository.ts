import {GetQueryPropertyType, MySQLWrapper} from '@lib/mysql/mysql-wrapper';
import {ConditionType} from '@lib/mysql/query-builder';
import {ProductTableKeyType, ProductTableSchemaType} from '@infrastructure/database/product-schema';
import {IProductBaseRepository} from '@infrastructure/database/product-base-repository-model';

export class ProductBaseRepository extends MySQLWrapper implements IProductBaseRepository {
    constructor() {
        super({tableName: 'product', tableShort: 'pd'});
    }
    insert(data: Omit<ProductTableSchemaType, 'id' | 'createdAt'>, onDuplicate?: string[]) {
        let ignore = false;
        if (!onDuplicate) {
            ignore = true;
        }
        return this._insert(data, {ignore, onDuplicate});
    }
    remove(keyObject: Partial<ProductTableKeyType>) {
        const conditions = this.getKeyConditions(keyObject);
        return this._delete(conditions);
    }
    updateOne(keyObject: Partial<ProductTableKeyType>, param: Partial<ProductTableSchemaType>) {
        const conditions = this.getKeyConditions(keyObject);
        return this._update(conditions, param);
    }
    read<T>(keyObject: Partial<ProductTableKeyType>, opt?: GetQueryPropertyType) {
        let conditions = this.getKeyConditions(keyObject);
        if (opt && opt.conditions) {
            conditions = conditions.concat(opt.conditions);
        }
        return this._get<T>(conditions, {...opt});
    }
    readOne<T>(keyObject: Partial<ProductTableKeyType>, opt?: GetQueryPropertyType) {
        const conditions = this.getKeyConditions(keyObject);
        return this._getOne<T>(conditions, {...opt});
    }
    count(keyObject: Partial<ProductTableKeyType>, opt?: GetQueryPropertyType) {
        const conditions = this.getKeyConditions(keyObject);
        return this._count(conditions);
    }
    protected getKeyConditions(query: Partial<ProductTableKeyType>) {
        let conditions: ConditionType[] = [];
        const {productId, editorId, status} = query;
        if (productId) {
            conditions.push({fieldName: 'po.id', value: productId});
        }
        if (editorId) {
            conditions.push({fieldName: 'po.editorId', value: editorId});
        }
        if (status) {
            conditions.push({fieldName: 'po.status', value: status});
        }
        return conditions;
    }
}

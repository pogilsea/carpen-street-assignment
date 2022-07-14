import {OkPacket} from 'mysql';
import {GetQueryPropertyType, IMySQLWrapper} from '@lib/mysql/mysql-wrapper';
import {ProductTableKeyType, ProductTableSchemaType} from '@infrastructure/database/product-schema';

export interface IProductBaseRepository extends IMySQLWrapper {
    insert(data: Omit<ProductTableSchemaType, 'id' | 'createdAt'>): Promise<OkPacket>;
    readOne(keyObject: Partial<ProductTableKeyType>, opt?: GetQueryPropertyType): Promise<any>;
    read(keyObject: Partial<ProductTableKeyType>, opt?: GetQueryPropertyType): Promise<any[]>;
    count(keyObject: Partial<ProductTableKeyType>, opt?: GetQueryPropertyType): Promise<number>;
    remove(keyObject: Partial<ProductTableKeyType>): Promise<OkPacket>;
    updateOne(keyObject: Partial<ProductTableKeyType>, param: Partial<ProductTableSchemaType>): Promise<OkPacket>;
}

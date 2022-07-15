import {OkPacket} from 'mysql';
import {GetQueryPropertyType, IMySQLWrapper} from '@lib/mysql/mysql-wrapper';
import {ProductTableKeyType, ProductTableSchemaType} from '@infrastructure/database/product-schema';

export interface IProductBaseRepository extends IMySQLWrapper {
    insert(data: Omit<ProductTableSchemaType, 'id' | 'createdAt'>): Promise<OkPacket>;
    readOne<T>(keyObject: Partial<ProductTableKeyType>, opt?: GetQueryPropertyType): Promise<T>;
    read<T>(keyObject: Partial<ProductTableKeyType>, opt?: GetQueryPropertyType): Promise<T[]>;
    count(keyObject: Partial<ProductTableKeyType>, opt?: GetQueryPropertyType): Promise<number>;
    remove(keyObject: Partial<ProductTableKeyType>): Promise<OkPacket>;
    updateOne(keyObject: Partial<ProductTableKeyType>, param: Partial<ProductTableSchemaType>): Promise<OkPacket>;
}

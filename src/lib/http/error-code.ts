export enum ErrorCode {
    SQL_WRITE_ERROR = 'COM0001',
    SQL_READ_ERROR = 'COM0002',
    NO_SELECT_CONDITION = 'COM1001',
    USER_UNAUTHORIZED = 'AUTH1001',
    USER_ROLE_FORBIDDEN = 'AUTH1002',
    DATA_NOT_EXIST_IN_STORAGE = 'COM1001',
    PRODUCT_STATUS_NOT_EDITABLE = 'PRD1001',
    PRODUCT_STATUS_ALREADY_REQUESTED_REVIEW = 'PRD1002',
    PRODUCT_STATUS_ALREADY_CONFIRMED = 'PRD1003',
    PRODUCT_STATUS_NOT_CONFIRM_EDITABLE = 'PRD1004',
    PRODUCT_NOT_KOREAN_LETTER = 'PRD1004',
}

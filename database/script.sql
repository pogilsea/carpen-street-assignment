create table product
(
    id                int auto_increment
        primary key,
    writerId          int                                                                             not null,
    status            enum ('INITIALIZED', 'REVIEW_REQUESTED', 'PUBLISHED') default 'INITIALIZED'     not null comment '상품 상태
INITIALIZED: 임시 저장(검토 이전 단계)
REVIEW_REQEUSETED: 에디터에게 검토 요청
PUBLISHED: 검토 완료 후 사용자에게 노출',
    title             varchar(255)                                                                    not null comment '상품제목',
    titleEn           varchar(255)                                                                    null,
    titleCn           varchar(255)                                                                    null,
    content           text                                                                            not null comment '상품 내용',
    contentEn         text                                                                            null,
    contentCn         text                                                                            null,
    price             int                                                                             not null comment '가격',
    commissionRate    decimal(10, 2)                                                                  null comment '수수료',
    createdAt         datetime                                              default CURRENT_TIMESTAMP not null,
    updatedAt         datetime                                                                        null,
    reviewRequestedAt datetime                                                                        null comment '요청 일자',
    publishedAt       datetime                                                                        null comment '발행 일자(검토 승인 일자)'
)
    comment '상품 관리 테이블';


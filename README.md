## 데이터 베이스 스키마 세팅 방법

**1. create database (MySQL Client)**

```mysql
CREATE DATABASE carpen_street CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**2. create tables (MySQL Client)**

```sql
< script.sql
```

- SQL 스크립트 파일은 database/script.sql 확인

# 데이터 베이스 접근 정보 확인(user, password)

**레포지토리 base 경로에서 .env 파일 확인**

```shell
cat ./.env
```


## 소스코드 실행 방법

**1. install node modules**

```shell
npm install
```

**2. build typescript**

```shell
tsc --watch
```

**3. run application**

```shell
npm run start
```


## 테스트 코드 실행 방법

**1. tart run test code**

```shell
npm run test
```


## 개발 환경 

- os: MacOS
- node: 16.15.1
- mysql: 8.0.29
- npm: 8.11.0
/// <reference types="react-scripts" />
//网络请求统一返回数据的格式

declare global {
    interface ResponseSuccess<T ={}> {
        success: boolean;
        errorMessage?: string;
        data: T;
    }
    interface Ipagination<T> {
        success: boolean;
        errorMessage?: string;
        data: {
            list: T[];
            current: 1;
            pageSize: number;
            total: number;
            totalPage: number;
        };
    }
    interface Window {
        logout(): void;
    }
}
export {};

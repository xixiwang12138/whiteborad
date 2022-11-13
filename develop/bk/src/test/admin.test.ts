import request from "sync-request";
import config from "../config.json";

const OK = 200;

const port = config.port;
const url = config.url;

describe('HTTP tests using Jest register', () => {
    test('Test successful register', () => {
        const res = request(
            'POST',
            `${url}:${port}/auth/register/v3`,
            {
                json: {
                    "email": "247473238@qq.com",
                    "password": "lalalala123",
                    "nameFirst": "kk",
                    "nameLast": "Jack"
                }
            }
        );
        const bodyObj =  JSON.parse(res.body.toString());
        expect(bodyObj.code).toEqual(OK);
    });
    test('Test invalid register', () => {
        const res = request(
            'POST',
            `${url}:${port}/auth/register/v3`,
            {
                json: {
                    "email": "247473238qq.com",
                    "password": "lalalala123",
                    "nameFirst": "",
                    "nameLast": "Jack"
                }
            }
        );
        const bodyObj =  JSON.parse(res.body.toString());
        // @ts-ignore
        expect(bodyObj.code).toEqual(400);
    });
});

describe('HTTP tests using Jest login', () => {
    test('Test successful login', () => {
        const res = request(
            'POST',
            `${url}:${port}/auth/login/v3`,
            {
                json: {
                    "email": "247473238@qq.com",
                    "password": "lalalala123"
                }
            }
        );
        const bodyObj =  JSON.parse(res.body.toString());
        expect(bodyObj.code).toEqual(OK);
    });
    test('Test invalid login', () => {
        const res = request(
            'POST',
            `${url}:${port}/auth/login/v3`,
            {
                json: {
                    "email": "247473238qq.com",
                    "password": "lalalal543a123",
                    "nameFirst": "",
                    "nameLast": "Jack"
                }
            }
        );
        const bodyObj =  JSON.parse(res.body.toString());
        // @ts-ignore
        expect(bodyObj.code).toEqual(400);
    });
});


describe('HTTP tests using Jest logout', () => {
    test('Test successful logout', () => {
        const res = request(
            'POST',
            `${url}:${port}/auth/logout/v2`,
            {
            }
        );
        const token =  res.headers.token;
        expect(token).toEqual('invalid');
    });
});

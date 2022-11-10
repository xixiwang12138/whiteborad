import {Simulate} from "react-dom/test-utils";
import load = Simulate.load;

type Constructor<T> = new(...args:any[]) => T;

export abstract class SerializableData {}

export function field(proto:any, key:string) {
    let arr = Dataloader.fields.get(proto.constructor.name);
    if(arr) arr.push(key);
    else arr = [key];
    Dataloader.fields.set(proto.constructor.name, arr);
}

export class Dataloader {

    public static fields:Map<string, string[]> = new Map<string, string[]>();

    public static load<T>(cls:Constructor<T>, data:string):T {
        let obj = JSON.parse(data);
        let res = new cls() as any;
        const fields = this.fields.get(cls.name);
        if(fields) {
            for(let k in fields) {
                switch (typeof res[k]) {
                    case "number":
                        res[k] = obj[k]; break;
                    case "string":
                        res[k] = obj[k]; break;
                    case "object":
                        if(res instanceof Array) {

                        }
                        if(res[k] instanceof SerializableData) {
                            // res[k] = this.load(res)
                        }
                }
            }
        }
        return res;
    }
}
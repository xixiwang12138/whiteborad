import {Constructor} from "./SingletonUtils";
import {DataLoader} from "../modules/coreModule/utils/DataLoader";

interface SubscriptionMethod {
    eventName: string;
    funcName: string;
}

interface Subscription {
    obj: any;
    funcName: string;
}

/**
 * 订阅事件的修饰器，放在成员函数上，参数为接收事件的类。当有事件发出时，
 * 被这个修饰器修饰的函数被调用，参数为事件对象。
 *
 * @param eventType 订阅的事件类型
 */
// export function subscriber(eventType: Constructor) {
//     const process = (obj: Object, key: string) => {
//         const cache = DataLoader.getOrCreateCache(obj);
//         cache.proto.subscriptions.push({eventName: eventType.name, funcName: key});
//     }
//     return process;
// }

class LoginEvent {
    account: string;

    constructor(account) {
        this.account = account;
    }
}

new LoginEvent("")

/**
 * 使用方法：<p>
 *
 * class LoginEvent{ //定义事件
 *     account:string;
 *     constructor(account){this.account=account;}
 * }
 *
 * class A{
 * .   @subscriber(LoginEvent)
 *     func1(e){
 *          console.log(e.account+"登录成功！")
 *     }
 * }
 *
 * let a1 = new A();
 * let a2 = new A();
 *
 * EventBus.register(a2);
 * EventBus.post(new LoginEvent("exer"));//a2的func1被调用
 *
 * EventBus.unregister(a2);
 * EventBus.post(new LoginEvent("exer"));//没有效果
 *
 */
// export class EventBus {
//     private static listeners: any = {};//从eventName:string到Subscription的映射
//
//     /**
//      * 注册指定的对象，之后有该对象监听的事件时，对应的函数会被调用
//      * @param obj
//      */
//     public static register(obj: any) {
//         let rgs = DataLoader.getOrCreateCache(obj).proto.subscriptions;
//         for (let i = 0; i < rgs.length; i++) {
//             let subs: SubscriptionMethod = rgs[i];
//             let eventName = subs.eventName;
//             this.listeners[eventName] ||= [];
//
//             let receivers: Subscription[] = this.listeners[eventName];
//
//             //检查重复注册
//             for (let j = 0; j < receivers.length; j++)
//                 if (receivers[j].obj == obj && receivers[j].funcName == subs.funcName)
//                     console.error(obj.constructor.name + "." + subs.funcName + "() 重复订阅了 " + eventName + "！");
//
//             //注册该事件
//             this.listeners[eventName].push({obj: obj, funcName: subs.funcName});
//         }
//     }
//
//     /**
//      * 让指定对象不再接收事件
//      * @param obj
//      */
//     public static unregister(obj: any) {
//         let rgs = DataLoader.getOrCreateCache(obj).proto.subscriptions;
//         for (let i = 0; i < rgs.length; i++) {
//             let subs: SubscriptionMethod = rgs[i];
//             let eventName = subs.eventName;
//             this.listeners[eventName] ||= [];
//
//             let receivers: Subscription[] = this.listeners[eventName];
//             for (let j = 0; j < receivers.length; j++) {
//                 if (receivers[j].obj != obj) continue;
//                 receivers.splice(j, 1);
//                 j--;
//             }
//         }
//     }
//
//     /**
//      * 发出一个事件，所有注册了这类事件的对象的对应函数会被调用
//      * @param event
//      */
//     public static post(event: any) {
//         this.listeners[event.constructor.name] ||= [];
//         let receivers: Subscription[] = this.listeners[event.constructor.name];
//         for (let i = 0; i < receivers.length; i++) {
//             let sub: Subscription = receivers[i];
//             sub.obj[sub.funcName](event);
//         }
//     }
//
// }

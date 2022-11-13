import {ScaleType} from "../../components/Widget";

export type InteractEventType = "none" | "down" | "move" | "up" | "doubleClick"
    | "hover" | "wheel"
    | "scalestart" | "scaling" | "scaleend";

export interface InteractEvent {
    x:number;
    y:number;
    type:InteractEventType
}

export function NewInteractEvent(eRaw:MouseEvent | TouchEvent) {
    if(eRaw instanceof MouseEvent) return new MouseInteractEvent(eRaw);
    else return new TouchInteractEvent(eRaw);
}

export class MouseInteractEvent implements InteractEvent {
    public x:number;
    public y:number;
    public type:InteractEventType = "none";

    constructor(e:MouseEvent) {
        this.x = e.x * window.devicePixelRatio;
        this.y = e.y * window.devicePixelRatio;
        switch (e.type) {
            case "mousedown":
                this.type = "down";
                break;
            case "mouseup":
                this.type = "up";
                break;
            case "mousemove":
                this.type = "move";
                break;
            case "wheel":
                this.type = "wheel";
                break;
        }

    }

}

export class TouchInteractEvent implements InteractEvent {
    public x:number = 0;
    public y:number = 0;
    public type:InteractEventType = "none";
    private static scaleStart:boolean = false;
    private static lastLen = 0; // 上次两个触点的距离
    public scaleType:ScaleType = "none";


    constructor(e:TouchEvent) {
        e.preventDefault();
        e.stopPropagation();
        let ts = e.touches;
        switch (e.type) {
            case "touchstart":
                if(ts.length === 1) {
                    this.type = "down";
                    this.x = e.touches[0].clientX * window.devicePixelRatio;
                    this.y = e.touches[0].clientY * window.devicePixelRatio;
                }
                if(ts.length === 2) {
                    this.type = "scalestart";
                    TouchInteractEvent.scaleStart = true;
                    TouchInteractEvent.lastLen = Math.pow(ts[0].clientX - ts[1].clientX, 2)
                        + Math.pow(ts[0].clientY - ts[1].clientY, 2);
                }
                break;
            case "touchend":
            case "touchcancel":
                if(ts.length > 0) {
                    if(ts.length === 1 && TouchInteractEvent.scaleStart) {
                        TouchInteractEvent.scaleStart = false;
                        TouchInteractEvent.lastLen = 0;
                        this.type = "scaleend";
                    }
                } else {
                    this.type = "up";
                    this.x = e.changedTouches[0].clientX * window.devicePixelRatio;
                    this.y = e.changedTouches[0].clientY * window.devicePixelRatio;
                }
                break;
            case "touchmove":
                if(ts.length === 1) {
                    this.type = "move";
                    this.x = e.touches[0].clientX * window.devicePixelRatio;
                    this.y = e.touches[0].clientY * window.devicePixelRatio;
                }
                if(ts.length === 2 && TouchInteractEvent.scaleStart) {
                    this.x = (ts[0].clientX + ts[1].clientX) * window.devicePixelRatio / 2;
                    this.y = (ts[0].clientY + ts[1].clientY) * window.devicePixelRatio / 2;
                    this.type = "scaling";
                    const newL = Math.pow(ts[0].clientX - ts[1].clientX, 2)
                        + Math.pow(ts[0].clientY - ts[1].clientY, 2);
                    if(newL < TouchInteractEvent.lastLen) this.scaleType = "small";
                    else this.scaleType = "enlarge";
                    TouchInteractEvent.lastLen = newL;
                }
                break;
        }

    }

}
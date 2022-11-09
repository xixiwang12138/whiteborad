
export type SceneTouchEventType = "down" | "move" | "up" | "doubleClick";

export class SceneTouchEvent {
    type:SceneTouchEventType
    rawX:number;
    rawY:number;
    x:number
    y:number
    constructor(type:SceneTouchEventType, x:number, y:number, rawX:number, rawY:number) {
        this.type = type; this.x = x; this.y = y;
        this.rawX = rawX; this.rawY = rawY;
    }
}
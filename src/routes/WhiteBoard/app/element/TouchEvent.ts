
export type SceneTouchEventType = "none" | "down" | "move" | "hover" | "up" | "doubleClick";

export class SceneTouchEvent {
    type:SceneTouchEventType
    rawX:number;
    rawY:number;
    x:number
    y:number
    constructor(x:number, y:number, rawX:number, rawY:number) {
        this.type = "none"; this.x = x; this.y = y;
        this.rawX = rawX; this.rawY = rawY;
    }

}
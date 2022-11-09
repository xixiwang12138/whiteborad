import {Point, Tool} from "./Tool";
import {SceneTouchEvent} from "../element/TouchEvent";
import {DrawingScene} from "../DrawingScene";


/**
 * 通用绘制工具
 */
export abstract class GenericDrawingTool extends Tool {

    protected last: Point = new Point(0, 0); // 上次点击位置

    protected abstract effective(scene: DrawingScene): boolean;

    protected abstract onDown(e: SceneTouchEvent, scene: DrawingScene):void;

    public op(e: SceneTouchEvent, scene: DrawingScene) {
        switch (e.type) {
            case "down":this.onDown(e, scene);break;
            case "move":this.onMove(e, scene);break;
            case "up":this.onUp(e, scene);break;
        }
    }

    protected onMove(e: SceneTouchEvent, scene: DrawingScene) {
        if (Math.abs(this.last.x - e.x) > 5 || Math.abs(this.last.y - e.y) > 5) {
            scene.actElem!.drawTo(e.x, e.y);
            scene.render();
            this.last.x = e.x;
            this.last.y = e.y;
        }
    }

    protected onUp(e: SceneTouchEvent, scene: DrawingScene) {
        // 完成绘制
        if (this.effective(scene)) {
            scene.addElem(scene.actElem!);
            scene.actElem!.finish = true;
        }
        scene.actElem = null;
    }


}

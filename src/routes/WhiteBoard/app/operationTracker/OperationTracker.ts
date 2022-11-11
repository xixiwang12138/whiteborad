import {FixedSizeStack} from "./Stack";

/**
 * 可否执行undo/redo操作监听器, 用于更新UI
 */

export type Op = "undo" | "redo";

export interface OperableListener {
    onAbilityChange(op:Op, ability:boolean);
}

export class OperationTracker<T> {

    private doStack:FixedSizeStack<T>; // 操作栈,maxSize为撤销步数上限

    private undoStack:FixedSizeStack<T>; // 撤销栈

    private listener: OperableListener | null = null;

    /**
     * @param maxStep 最大可undo步数，即为doStack的栈大小
     */
    public constructor(maxStep: number) {
        this.doStack = new FixedSizeStack<T>(maxStep);
        this.undoStack = new FixedSizeStack<T>(maxStep);
    }

    public setOperableListener(listener: OperableListener) {
        this.listener = listener;
    }

    public do(op: T){
        this.doStack.push(op);
        this.undoStack.empty();
        this.listener?.onAbilityChange("redo", false);
        if(this.doStack.size == 1) {
            this.listener?.onAbilityChange("undo", true);
        }
    }

    /**
     * 返回null表示不可undo（应先在listener回调时在UI disable对应按钮）
     */
    public undo():T | null{
        if(this.doStack.isEmpty() || this.undoStack.isFull()) return null;
        let ret = this.doStack.pop();
        this.undoStack.push(ret);
        if(this.undoStack.size == 1) this.listener?.onAbilityChange("redo", true);
        if(this.doStack.isEmpty() || this.undoStack.isFull()) this.listener?.onAbilityChange("undo", false);
        return ret;
    }

    public redo():T | null {
        if(this.undoStack.isEmpty() || this.doStack.isFull()) return null;
        let ret = this.undoStack.pop();
        this.doStack.push(ret);
        if(this.doStack.size === 1) this.listener?.onAbilityChange("undo", true);
        if(this.undoStack.isEmpty() || this.doStack.isFull()) this.listener?.onAbilityChange("redo", false);
        return ret;
    }

}
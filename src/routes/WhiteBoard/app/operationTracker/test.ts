import {OperationTracker, OperableListener} from "./OperationTracker";


let tracker = new OperationTracker<number>(2);
tracker.setOperableListener(new class implements OperableListener {
    onNotRedoable(): void {
        console.log("onNotRedoable");
    }

    onNotUndoable(): void {
        console.log("onNotUndoable");
    }

    onRedoable(): void {
        console.log("onRedoable");
    }

    onUndoable(): void {
        console.log("onUndoable");
    }
})

tracker.do(1);
tracker.do(2);
console.log(tracker.undo());
console.log(tracker.redo());
console.log(tracker.undo());
tracker.do(3);
console.log(tracker.undo());


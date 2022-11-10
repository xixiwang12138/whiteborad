
class ListNode<T> {
    elem:T;
    prev:ListNode<T> | null = null; // 前驱指针
    next:ListNode<T> | null = null;
    constructor(elem:T) {
        this.elem = elem;
    }
}

// 用双向链表实现的栈
export class Stack<T> {

    protected head:ListNode<T> | null = null;
    protected bottom:ListNode<T> | null = null; // 栈底指针
    protected maxSize:number;
    public size:number = 0;

    constructor(maxSize: number) {
        this.maxSize = maxSize;
    }

    public push(elem:T) {
        if(this.size == this.maxSize) throw "Full Stack";
        let node = new ListNode<T>(elem);
        node.next = this.head;
        if(this.head == null) this.bottom = node;
        else this.head.prev = node;
        this.head = node;
        this.size++;
    }

    public pop():T {
        if(this.head == null) throw "Empty Stack";
        let n = this.head;
        this.head = this.head.next;
        if(this.head != null)  this.head.prev = null;
        else this.bottom = null;
        n.next = null;
        this.size--;
        return n.elem;
    }

    public top():T {
        if(this.head == null) throw "Empty Stack";
        return this.head.elem;
    }

    public isEmpty():boolean {
        return this.size == 0;
    }

    public empty() {
        this.size = 0;
        this.head = this.bottom = null;
    }

    public isFull():boolean {
        return this.maxSize == this.size;
    }

    public print() {
        for(let n = this.head;n != null;n = n.next) {
            console.log(`${n.elem}\n`)
        }
    }
}

export class FixedSizeStack<T> extends Stack<T>{

    // 弹出尾部元素
    private popBack() {
        if(this.bottom == null) throw "Empty Stack";
        let b = this.bottom;
        this.bottom = this.bottom.prev;
        if(this.bottom != null) this.bottom.next = null;
        else this.head = null;
        b.prev = null;
        this.size--;
    }

    public push(elem: T) {
        if(this.isFull()) this.popBack();
        super.push(elem);
    }

}


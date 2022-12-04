
/**
 * 变换矩阵
 */
export class Transition2DMatrix {

    private matrix = new Array<Array<number>>(3);

    private constructor() {
        for(let i = 0;i < 2;i++) {
            this.matrix[i] = new Array<number>(3);
        }
    }


}

export class RotateUtil {

    // 𝑎′𝑥=(𝑎𝑥−𝑐𝑥)cos𝜃−(𝑎𝑦−𝑐𝑦)sin𝜃+𝑐𝑥
    // 𝑎′𝑦=(𝑎𝑥−𝑐𝑥)sin𝜃+(𝑎𝑦−𝑐𝑦)cos𝜃+𝑐𝑦.
    public static rotate(x1:number, y1:number, sx:number, sy:number, angle:number) {
        return   [
            (x1 - sx) * Math.cos(angle) - (y1 - sy) * Math.sin(angle) + sx,
            (x1 - sx) * Math.sin(angle) + (y1 - sy) * Math.cos(angle) + sy,
        ];
    }

    /**
     * @param points 必须为2的倍数
     * @param sx 旋转中心点x
     * @param sy 旋转中心点y
     * @param angle
     */
    public static rotatePoints(points:number[], sx:number, sy:number, angle:number) {
        const bound = points.length / 2;
        for(let i = 0;i < bound;i++) {
            const point = this.rotate(points[2 * i], points[2 * i + 1], sx, sy, angle);
            points[2 * i] = point[0]
            points[2 * i + 1] = point[1];
        }
    }
}

export class ScaleUtil {

    public static scale(x:number, y:number, fx:number, fy:number, sx:number, sy:number) {
        return [
            sx + (x - sx) * fx,
            sy + (y - sy) * fy
        ]
    }

    public static scalePoints(points:number[], fx:number, fy:number, sx:number, sy:number) {
        const bound = points.length / 2;
        for(let i = 0;i < bound;i++) {
            [points[2 * i], points[2 * i + 1]] = this.scale(points[2 * i], points[2 * i + 1], fx, fy, sx, sy);
        }
    }

}

export function randomPick<T>(arr: T[]) {
    const randomIdx = Math.floor(Math.random()*arr.length)
    return arr[randomIdx]
}

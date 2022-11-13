/**
 * 对字符串编码解码的工具，目前用来加密请求和返回结果的字符串。<p>
 * 基本原理是把字符串转为utf-8编码，然后对每一个byte进行位操作
 */
export class ParamCodec {
    static charset: string = "0123456789ABCDEF";
    static perms: number[][] = undefined;

    /**
     * 加密一个字符串
     * @param params 要加密的字符串
     */
    public static encode(params: string): string {
        if (this.perms == undefined) this.init();
        let arr: Uint8Array = new TextEncoder().encode(params);
        let seed = this.hash(arr);
        let result = "";
        for (let i = 0; i < 4; i++) {
            result += this.charset[(seed >> (4 * i)) & 0xF];
        }

        for (let i = 0; i < arr.length; i++) {
            let ch = arr[i];
            seed = this.nextInt(seed);
            ch = this.shuffleByte(ch, this.perms[seed % 40320]);
            let hi = ch >> 4;
            let lo = ch & 0xF;
            result += this.charset[hi] + this.charset[lo];
        }
        return result;
    }

    /**
     * 解密一个被加密的字符串
     * @param coded 被加密的字符串
     * @return 字符串解密后的结果，如果传入的参数非法，则返回null
     */
    public static decode(coded: string): string {
        if (this.perms == undefined) this.init();
        let arr: Uint8Array = new TextEncoder().encode(coded);
        if (arr.length < 4) return null;
        if ((arr.length - 4) % 2 != 0) return null;
        let seed = 0;
        let result = [];
        for (let i = 0, base = 1; i < 4; i++, base *= 16) {
            let idx = this.charset.indexOf(String.fromCharCode(arr[i]));
            if (idx < 0) return null;
            seed += base * idx;
        }
        for (let i = 0; i < arr.length - 4; i += 2) {
            let hi = this.charset.indexOf(String.fromCharCode(arr[i + 4]));
            let lo = this.charset.indexOf(String.fromCharCode(arr[i + 5]));
            if (hi < 0 || lo < 0) return null;
            let ch = hi * 16 + lo;
            seed = this.nextInt(seed);
            ch = this.deshuffleByte(ch, this.perms[seed % 40320]);
            result.push(ch)
        }
        let buf = new Uint8Array(result);
        return new TextDecoder().decode(buf);
    }

    private static init() {
        this.perms = [];
        let p = [0, 1, 2, 3, 4, 5, 6, 7];
        for (let i = 0; i < 40320; i++) {
            this.perms.push(p.slice());
            this.nextPermutation(p);
        }
    }

    private static nextInt(seed: number) {
        const A = 5461;
        const C = 97;
        const M = 65520;
        return (seed * A + C) % M;
    }

    private static hash(arr: Uint8Array) {
        let result = 43;
        for (let i = 0; i < arr.length; i++)
            result = (result * 97 + arr[i]) % 40320;
        return result;
    }

    private static shuffleByte(bt: number, pm) {
        let bts = [];
        for (let i = 0; i < 8; i++) {
            bts[pm[i]] = bt % 2;
            bt >>= 1;
        }
        return this.array2byte(bts);
    }

    private static deshuffleByte(bt: number, pm) {
        let bts = [], un = [];
        for (let i = 0; i < 8; i++) {
            bts[i] = bt % 2;
            bt = bt >> 1;
        }
        for (let i = 0; i < 8; i++)
            un[i] = bts[pm[i]];
        return this.array2byte(un);
    }

    private static array2byte(arr) {
        let w = 1, result = 0;
        for (let i = 0; i < 8; i++) {
            result += w * arr[i];
            w *= 2;
        }
        return result;
    }

    private static nextPermutation(nums) {
        let n = nums.length, i, j;
        for (i = n - 2; i >= 0; i--) {
            if (nums[i + 1] <= nums[i]) continue;
            for (j = n - 1; j > i; j--)
                if (nums[j] > nums[i]) break;
            this.swap(nums, i, j);
            this.reverse(nums, i + 1);
            return;
        }
        nums.reverse();
    }

    private static swap(nums, i, j) {
        let tmp = nums[i];
        nums[i] = nums[j];
        nums[j] = tmp;
    }

    private static reverse(nums, i) {
        let n = nums.length - 1;
        while (i < n) {
            this.swap(nums, i, n);
            i++;
            n--;
        }
    }
}
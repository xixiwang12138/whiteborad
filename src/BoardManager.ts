import {WhiteBoard} from "./routes/WhiteBoard/app/data/WhiteBoard";
import {getBoardInfo} from "./api/api";


export class BoardManager {

    private static board: WhiteBoard

    public static async syncWhiteBoard() {
        const arr = window.location.href.split("/")
        const boardId = arr[arr.length - 1]
        this.board = await getBoardInfo(boardId)
        return this.board
    }

    public async getId() {
        const arr = window.location.href.split("/")
        return arr[arr.length - 1]
    }


    public static async getName() {
        if(!this.board) await this.syncWhiteBoard();
        return this.board.name;
    }


    public static async getCreator() {
        if(!this.board) await this.syncWhiteBoard();
        return this.board.creator;
    }

    public static async getMode() {
        if(!this.board) await this.syncWhiteBoard();
        return this.board.mode;
    }
}

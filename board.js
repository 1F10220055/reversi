class Board {
    constructor() {
        // 盤面の状態
        this.board = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 2, 1, 0, 0, 0],
            [0, 0, 0, 1, 2, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];

        this.boardBlack = 0x0000000810000000n;
        this.boardWhite = 0x0000001008000000n;

        this.black = 2;         // 黒の石の数
        this.white = 2;         // 白の石の数
    }


    // ひっくり返せる石のリストを返す
    canTurnoverList(x, y, color) {
        let result = [];

        // 指定したマスの石が相手の石かを判定
        const isOpponent = (x, y, color) => {
            if (color === 1) {
                return this.board[y][x] === 2;
            } else
                if (color === 2) {
                    return this.board[y][x] === 1;
                }
        }

        // 方向を指定し、その方向のひっくり返せるコマを返す関数
        // 方向は-1~1の整数を2合わせて指定する（ただし0,0は指定しない）
        // 1,1であれば右上、-1,-1であれば左下といった具合
        const direction2turn = (pos, direction) => {
            let result = [];
            pos.x += direction.x;
            pos.y += direction.y;
            while (pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8) {
                if (isOpponent(pos.x, pos.y, color)) {
                    // 相手の石ならば、resultに石を追加
                    result.push({ ...pos });
                    pos.x += direction.x;
                    pos.y += direction.y;
                } else if (this.board[pos.y][pos.x] === color) {
                    // 自分の石ならば、その時点の結果を返す
                    return result;
                } else {
                    break;
                }
            }
            // ループが終了された場合は、空配列を返す
            return [];
        }

        // -1,-1 ~ 1,1について探索
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (i === 0 && j === 0) continue;
                let turn = direction2turn({ x: x, y: y }, { x: j, y: i });
                result = result.concat(turn);
            }
        }

        return result;
    }

    // 盤面に設置可能なマスがあるかを判定
    canPut(color) {
        // 盤面の全てのマスを探索
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                // 既に石のあるマスは探索しない
                if (this.board[y][x] !== 0) continue;
                if (this.canTurnoverList(x, y, color).length > 0) {
                    // 一つでもひっくり返せるマスがあればtrueを返す
                    return true;
                }
            }
        }
        return false;
    }

    // 石を置いた際の盤面の状態を更新
    putStone(x, y, color) {
        // ひっくり返せる石のリストを取得
        let turnoverList = this.canTurnoverList(x, y, color);
        // ひっくり返せる石がなければ終了
        if (turnoverList.length === 0) return false;

        // 石を置く
        this.board[y][x] = color;
        if (color === 1) {
            this.black++;
        } else if (color === 2) {
            this.white++;
        }

        // コマをひっくり返す
        for (let cell of turnoverList) {
            this.board[cell.y][cell.x] = color;
            if (color === 1) {
                this.black++;
                this.white--;
            } else if (color === 2) {
                this.white++;
                this.black--;
            }
        }

        // 正常に終了すればtrueを返す
        return true;
    }

    // 終了の判定
    // 終了の場合はどちらが勝ったかを返す
    judge() {
        // どちらも石が置けない場合
        if (!this.canPut(1) && !this.canPut(2)) {
            if (this.black === this.white) {
                return '引き分け'
            } else {
                if (this.black > this.white) {
                    return `${this.black}対${this.white}で黒の勝ち`;
                } else {
                    return `${this.white}対${this.black}で白の勝ち`
                }
            }
        }
        return 'continue';
    }

    getStoneColor(x, y) {
        return this.board[y][x];
    }

    getStoneColorToBitBoard(x, y) {
        let mask = this.pointToBit(x, y);
        if (this.boardBlack & mask) {
            return 1;
        } else if (this.boardWhite & mask) {
            return 2;
        } else {
            return 0;
        }
    }

    clone() {
        let clone = new Board();
        clone.board = JSON.parse(JSON.stringify(this.board));
        clone.black = this.black;
        clone.white = this.white;
        return clone;
    }

    pointToBit(x, y) {
        let mask = 0x8000000000000000n;
        if (0 <= x < 8 && 0 <= y < 8) {
            return mask >> BigInt(y * 8 + x);
        } else {
            throw new Error('out of range');
        }
    }
}

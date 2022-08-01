const black = 0;
const white = 1;


class BitBoard {
    constructor() {
        this.boardBlack = 0x0000000810000000n;
        this.boardWhite = 0x0000001008000000n;
        this.legalBoard = 17729692631040n;
        this.turn = 0;

        //Constants
        this._verticalMask = 0x7e7e7e7e7e7e7e7en;
        this._horizonMask  = 0x00ffffffffffff00n;
        this._allSideMask  = 0x007e7e7e7e7e7e00n;
    }


    // 連続する石を返す
    lookup(self, opponent, mask, shift) {
        mask &= opponent;
        let result = mask & shift(self);
        result |= mask & shift(result);
        result |= mask & shift(result);
        result |= mask & shift(result);
        result |= mask & shift(result);
        result |= mask & shift(result);
        return result;
    }


    // 合法手を生成する
    makeLegalBoard() {
        let blankBoard = ~(this.boardBlack | this.boardWhite);
        let self = this.turn === black ? this.boardBlack : this.boardWhite;
        let opponent = this.turn === black ? this.boardWhite : this.boardBlack;

        const lookup = this.lookup;
        const _lookup = (mask, shift) => {
            let result = lookup(self, opponent, mask, shift);
            return blankBoard & shift(result);
        }

        let result = _lookup(this._verticalMask, (pos) => pos << 1n);
        result |= _lookup(this._verticalMask, (pos) => pos >> 1n);
        result |= _lookup(this._horizonMask, (pos) => pos << 8n);
        result |= _lookup(this._horizonMask, (pos) => pos >> 8n);
        result |= _lookup(this._allSideMask, (pos) => pos << 9n);
        result |= _lookup(this._allSideMask, (pos) => pos << 7n);
        result |= _lookup(this._allSideMask, (pos) => pos >> 7n);
        result |= _lookup(this._allSideMask, (pos) => pos >> 9n);

        this.legalBoard = result;
    }


    // ターン交代・合法手生成
    changeTurn() {
        this.turn = 1 - this.turn;
        this.makeLegalBoard();
    }


    // 指定したマスが合法手かどうか調べる
    isLegal(pos) {
        return (this.legalBoard & pos) !== 0n;
    }


    // マスの色を返す
    getStoneColor(pos) {
        return (this.boardBlack & pos) !== 0n ? 0 : (this.boardWhite & pos) !== 0n ? 1 : 2;
    }


    // ひっくり返せる石を返す
    flipList(pos, color) {
        let self = color === black ? this.boardBlack : this.boardWhite;
        let opponent = color === black ? this.boardWhite : this.boardBlack;

        const lookup = this.lookup;
        const _lookup = (mask, shift) => {
            let result = lookup(pos, opponent, mask, shift);
            if (!(self & shift(result))) result = 0n;
            return result;
        }

        let result = _lookup(this._verticalMask, (pos) => pos << 1n);
        result |= _lookup(this._verticalMask, (pos) => pos >> 1n);
        result |= _lookup(this._horizonMask, (pos) => pos << 8n);
        result |= _lookup(this._horizonMask, (pos) => pos >> 8n);
        result |= _lookup(this._allSideMask, (pos) => pos << 9n);
        result |= _lookup(this._allSideMask, (pos) => pos << 7n);
        result |= _lookup(this._allSideMask, (pos) => pos >> 7n);
        result |= _lookup(this._allSideMask, (pos) => pos >> 9n);

        return result;
    }


    // 着手
    move(pos) {
        if (!this.isLegal(pos)) return false;   // 着手出来ない場合はfalseが返る
        let flip = this.flipList(pos, this.turn);
        if (this.turn === black) {
            this.boardBlack |= pos | flip;
            this.boardWhite ^= flip;
        } else {
            this.boardWhite |= pos | flip;
            this.boardBlack ^= flip;
        }
        this.changeTurn();
        return true;    // 着手出来た場合はtrueが返る
    }


    // 盤面に石を置けるか調べる
    canPut() {
        return this.legalBoard !== 0n;
    }


    // 盤面をコピーする
    clone() {
        let clone = new BitBoard();
        clone.boardBlack = this.boardBlack;
        clone.boardWhite = this.boardWhite;
        clone.legalBoard = this.legalBoard;
        clone.turn = this.turn;
        return clone;
    }
}
class BitBoard {
    constructor() {
        this.boardBlack = 0x0000000810000000n;
        this.boardWhite = 0x0000001008000000n;
        this.legalBoard = 17729692631040n;
        this.turn = 1;

        //Constants
        this._verticalMask = 0x7e7e7e7e7e7e7e7en;
        this._horizonMask  = 0x00ffffffffffff00n;
        this._allSideMask  = 0x007e7e7e7e7e7e00n;
    }


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


    makeLegalBoard() {
        let blankBoard = ~(this.boardBlack | this.boardWhite);
        let self = this.turn === 1 ? this.boardBlack : this.boardWhite;
        let opponent = this.turn === 1 ? this.boardWhite : this.boardBlack;

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


    changeTurn() {
        this.turn = this.turn === 1 ? 2 : 1;
        this.makeLegalBoard();
    }


    isLegal(pos) {
        return (this.legalBoard & pos) !== 0n;
    }


    getStoneColor(pos) {
        return (this.boardBlack & pos) !== 0n ? 1 : (this.boardWhite & pos) !== 0n ? 2 : 0;
    }


    flipList(pos, color) {
        let self = color === 1 ? this.boardBlack : this.boardWhite;
        let opponent = color === 1 ? this.boardWhite : this.boardBlack;

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


    move(pos) {
        if (!this.isLegal(pos)) return false;
        let flip = this.flipList(pos, this.turn);
        if (this.turn === 1) {
            this.boardBlack |= pos;
            this.boardBlack |= flip;
            this.boardWhite &= ~flip;
        } else {
            this.boardWhite |= pos;
            this.boardWhite |= flip;
            this.boardBlack &= ~flip;
        }
        this.changeTurn();
        return true;
    }


    canPut() {
        return this.legalBoard !== 0n;
    }

    clone() {
        let clone = new BitBoard();
        clone.boardBlack = this.boardBlack;
        clone.boardWhite = this.boardWhite;
        clone.legalBoard = this.legalBoard;
        clone.turn = this.turn;
        return clone;
    }
}
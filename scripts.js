// ゲーム中に書き換えるHTML要素
const boardElement = document.getElementById('board');
const colorElement = document.getElementById('color');
const coverElement = document.getElementById('cover');


// 盤面とそれに関わる処理を持つクラス
class Board {
    constructor(player) {
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
        this.player = player;   // プレイヤーの色
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
}


// プレイヤーが石を置こうとした時の処理
const handleClick = (h, w) => {
    // 既に石が置かれている場合は処理しない
    if (board.board[h][w] !== 0) return;
    // 連続で操作出来ないように覆いを付ける
    coverElement.style.display = 'block';

    // 石を置く
    let putted = board.putStone(w, h, board.player);
    // 正しく処理できた場合
    if (putted) {
        // 盤面の表示を更新
        displayBoard();
        // 終了の判定
        let judgeResult = board.judge();
        if (judgeResult === 'continue') {
            // 続行の場合
            if (board.canPut(board.player === 1 ? 2 : 1)) {
                // 相手が石を置ける場合はCPUのターンに移行
                opponent();
            } else {
                // 相手が石を置けない場合
                // その旨を表示し、盤面の数字を更新
                alert('置くことの出来るマスが存在しないため、CPUのターンがスキップされます。')
                displayNumber();
            }
        } else {
            // 終了の場合
            // リザルトを表示
            alert(judgeResult)
            return;
        }
    }

    // 覆いを外す
    coverElement.style.display = 'none';
}


// CPUのターン
const opponent = () => {
    let maxPut = 0;
    let pos;
    let color = board.player === 1 ? 2 : 1;

    // 盤面の全てのマスを探索
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (board.board[y][x] !== 0) continue;
            let turnoverList = board.canTurnoverList(x, y, color);
            if (turnoverList.length > maxPut) {
                // 設置可能なマスで、ひっくり返せる最大値の取得
                maxPut = turnoverList.length;
                pos = { 'x': x, 'y': y };
            }
        }
    }

    // 石を置く
    board.putStone(pos.x, pos.y, color)
    // 盤面の表示を更新
    displayBoard();
    // 終了の判定
    judgeResult = board.judge();
    if (judgeResult === 'continue') {
        // 続行の場合
        if (!board.canPut(color === 1 ? 2 : 1)) {
            // プレイヤーが石を置けない場合
            // その旨を表示し、もう一度CPUのターンに移行
            alert('置く事の出来るマスが存在しないため、あなたのターンがスキップされます。')
            opponent(color);
        } else {
            // プレイヤーが石を置ける場合
            // 盤面の数字を更新
            displayNumber();
        }
    } else {
        // 終了の場合
        // リザルトを表示
        alert(judgeResult)
        return;
    }
}


// 盤面を表示する関数
const displayBoard = () => {
    boardElement.innerHTML = '';
    for (let h = 0; h < 8; h++) {
        let newTbody = document.createElement('tbody');
        let newTr = document.createElement('tr');
        newTr.setAttribute('class', 'row');
        for (let w = 0; w < 8; w++) {
            let newTd = document.createElement('td');
            newTd.setAttribute('class', 'cell');
            let newButton = document.createElement('button');
            newButton.setAttribute('id', `${h}-${w}`);
            if (board.board[h][w] === 1) {
                newButton.textContent = '●';
                newButton.setAttribute('class', 'black');
            } else if (board.board[h][w] === 2) {
                newButton.textContent = '●';
                newButton.setAttribute('class', 'white');
            }
            newButton.addEventListener('click', () => {
                handleClick(h, w);
            })
            newTd.appendChild(newButton);
            newTr.appendChild(newTd);
        }
        newTbody.appendChild(newTr);
        boardElement.appendChild(newTbody);
    }
}


// 石を置ける場所に、ひっくり返せる石の数を表示する関数
const displayNumber = () => {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (board.board[i][j] !== 0) continue;
            let turnoverList = board.canTurnoverList(j, i, board.player);
            if (turnoverList.length > 0) {
                let newSpan = document.createElement('span');
                newSpan.setAttribute('class', 'number');
                newSpan.textContent = turnoverList.length;
                document.getElementById(`${i}-${j}`).appendChild(newSpan);
            }
        }
    }
}


let board = new Board(player = Math.floor(Math.random() * 2) + 1);
displayBoard();
displayNumber();
if (board.player === 2) {
    opponent(1);
    colorElement.textContent = '○';
};

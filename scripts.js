// ゲーム中に書き換えるHTML要素
const boardElement = document.getElementById('board');
const colorElement = document.getElementById('color');
const coverElement = document.getElementById('cover');
const blackCounter = document.getElementById('black-counter');
const whiteCounter = document.getElementById('white-counter');


const pointToBit = (x, y) => {
    let mask = 0x8000000000000000n;
    if (0 <= x < 8 && 0 <= y < 8) {
        return mask >> BigInt(y * 8 + x);
    } else {
        throw new Error('out of range');
    }
}


const countUp = (board) => {
    board = board - ((board >> 1n) & 0x5555555555555555n);
    board = (board & 0x3333333333333333n) + ((board >> 2n) & 0x3333333333333333n);
    board = (board + (board >> 4n)) & 0x0f0f0f0f0f0f0f0fn;
    board = board + (board >> 8n);
    board = board + (board >> 16n);
    board = board + (board >> 32n);
    return board & 0x0000007fn;
}


const judge = () => {
    let black = countUp(board.boardBlack);
    let white = countUp(board.boardWhite);
    if (black > white) {
        return `${black} 対 ${white}で黒の勝ちです。`;
    } else if (black < white) {
        return `${white} 対 ${black}で白の勝ちです。`;
    } else {
        return `${black} 対 ${white}で引き分けです。`;
    }
}


// 盤面評価
let scoreMemo = [];
const scoreInit = () => {
    let score = [30, -12, 0, -1,
                -12, -15, -3, -3,
                0, -3, 0, -1,
                -1, -3, -1, -1]
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 2 ** 8; j++) {
            scoreMemo.push(0);
            for (let k = 0; k < 8; k++) {
                if ((j >> k) & 1) {
                    if (i < 4) {
                        if (k < 4) {
                            scoreMemo[-1] += score[i * 4 + k]
                        } else {
                            scoreMemo[-1] += score[i * 4 + (7 - k)]
                        }
                    } else {
                        if (k < 4) {
                            scoreMemo[-1] += score[(7 - i) * 4 + k]
                        } else {
                            scoreMemo[-1] += score[(7 - i) * 4 + (7 - k)]
                        }
                    }
                }
            }
        }
    }
}
scoreInit();

const evaluate = (board) => {
    let blackEval = 0;
    let whiteEval = 0;
    for (let i = 0n; i < 8; i++) {
        black = (board.boardBlack >> (i * 8n)) & 0xffn;
        white = (board.boardWhite >> (i * 8n)) & 0xffn;
        blackEval += scoreMemo[i * 256n + black];
        whiteEval += scoreMemo[i * 256n + white];
    }

    if (board.turn === 1) {
        return blackEval - whiteEval;
    } else {
        return whiteEval - blackEval;
    }
}


// プレイヤーが石を置こうとした時の処理
const handleClick = (pos) => {
    // 合法手でない場合は処理を終了する
    if (!board.isLegal(pos)) return;
    // 連続で操作出来ないように覆いを付ける
    coverElement.style.display = 'block';

    // 石を置く
    board.move(pos);

    displayBoard();
    displayCounter();
    // 終了の判定
    if (!board.canPut()) {
        board.changeTurn();
        if (!board.canPut()) {
            alert(judge());
            return;
        } else {
            alert('置くことの出来るマスが存在しないため、CPUのターンがスキップされます。')
            displayNumber();
        }
    } else {
        opponent();
    }
    // 覆いを外す
    coverElement.style.display = 'none';
}


// CPUのターン
const opponent = () => {
    const search = () => {
        let eval = -Infinity;
        let pos = 0x8000000000000000n;
        let res;
        for (let i = 0; i < 64; i++) {
            if (board.isLegal(pos)) {
                let cloneBoard = board.clone();
                cloneBoard.move(pos);
                let score = -evaluate(cloneBoard);
                if (score > eval) {
                    eval = score;
                    res = pos;
                }
            }
            pos >>= 1n;
        }
        return res;
    }

    let pos = search();

    // 石を置く
    board.move(pos)
    // 盤面の表示を更新
    displayBoard();
    displayCounter();

    if (!board.canPut()) {
        board.changeTurn();
        if (!board.canPut()) {
            alert(judge());
            return;
        } else {
            alert('置くことの出来るマスが存在しないため、あなたターンがスキップされます。')
            opponent();
        }
    } else {
        displayNumber();
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
            let color = board.getStoneColor(pointToBit(w, h));
            if (color === 1) {
                newButton.textContent = '●';
                newButton.setAttribute('class', 'black');
            } else if (color === 2) {
                newButton.textContent = '●';
                newButton.setAttribute('class', 'white');
            }
            newButton.addEventListener('click', () => {
                handleClick(pointToBit(w, h));
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
            if (!board.isLegal(pointToBit(j, i))) continue;
            let flipCount = countUp(board.flipList(pointToBit(j, i), board.turn));
            let newSpan = document.createElement('span');
            let button = document.getElementById(`${i}-${j}`);
            newSpan.setAttribute('class', 'number');
            newSpan.textContent = flipCount;
            
            newSpan.addEventListener('mouseover', () => {
                let flipList = board.flipList(pointToBit(j, i), board.turn);
                for (let y = 0; y < 8; y++) {
                    for (let x = 0; x < 8; x++) {
                        if ((flipList & pointToBit(x, y)) !== 0n) {
                            let button = document.getElementById(`${y}-${x}`);
                            button.classList.add('flip');
                        }
                    }
                }
            })
            
            newSpan.addEventListener('mouseout', () => {
                for (let y = 0; y < 8; y++) {
                    for (let x = 0; x < 8; x++) {
                        let button = document.getElementById(`${y}-${x}`);
                        button.classList.remove('flip');
                    }
                }
            })
            
            button.appendChild(newSpan);
        }
    }
}


const displayCounter = () => {
    blackCounter.textContent = countUp(board.boardBlack);
    whiteCounter.textContent = countUp(board.boardWhite);
}


let board = new BitBoard();
let player = Math.floor(Math.random() * 2) + 1;
if (player === 2) {
    opponent();
    colorElement.textContent = '○';
}

displayBoard();
displayNumber();
displayCounter();

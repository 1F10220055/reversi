// ゲーム中に書き換えるHTML要素
const boardElement = document.getElementById('board');
const colorElement = document.getElementById('color');
const coverElement = document.getElementById('cover');
const blackCounter = document.getElementById('black-counter');
const whiteCounter = document.getElementById('white-counter');


// プレイヤーが石を置こうとした時の処理
const handleClick = (h, w) => {
    // 既に石が置かれている場合は処理しない
    if (board.getStoneColor(w, h) !== 0) return;
    // 連続で操作出来ないように覆いを付ける
    coverElement.style.display = 'block';

    // 石を置く
    let putted = board.putStone(w, h, player);
    // 正しく処理できた場合
    if (putted) {
        // 盤面の表示を更新
        displayBoard();
        displayCounter();
        // 終了の判定
        let judgeResult = board.judge();
        if (judgeResult === 'continue') {
            // 続行の場合
            if (board.canPut(player === 1 ? 2 : 1)) {
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
    let pos;
    let color = player === 1 ? 2 : 1;

    const getMax = (board, color) => {
        let max = 0;
        let pos;
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (board.getStoneColor(x, y) !== 0) continue;
                let turnoverList = board.canTurnoverList(x, y, color);
                if (turnoverList.length > max) {
                    max = turnoverList.length;
                    pos = { x, y };
                }
            }
        }
        return { max, pos };
    }

    const isEdge = (x, y) => {
        return y === 7 && x === 7 || y === 0 && x === 0 || y === 7 && x === 0 || y === 0 && x === 7
    }

    const isNearEdge = (x, y) => {
        let upperLeft = y === 1 && x === 1 || y === 0 && x === 1 || y === 1 && x === 0;
        let upperRight = y === 1 && x === 6 || y === 0 && x === 6 || y === 1 && x === 7;
        let lowerLeft = y === 7 && x === 1 || y === 6 && x === 1 || y === 6 && x === 0;
        let lowerRight = y === 6 && x === 6 || y === 7 && x === 6 || y === 6 && x === 7
        return upperLeft || upperRight || lowerLeft || lowerRight;
    }

    const calcScore = (board, color, x, y) => {
        if (board.getStoneColor(x, y) !== 0) return;
        let turnoverList = board.canTurnoverList(x, y, color);
        if (turnoverList.length === 0) return;
        let score = 0;
        score += turnoverList.length;
        let nextBoard = board.clone();
        nextBoard.putStone(x, y, color);
        let opponent = getMax(nextBoard, color === 1 ? 2 : 1);
        score -= opponent.max * 1.5;
        if (isEdge(x, y)) score += 5;
        if (isNearEdge(x, y)) score -= 5;
        return score;
    }

    const search = () => {
        let pos;
        let score = -Infinity;
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (board.getStoneColor(x, y) !== 0) continue;
                let turnoverList = board.canTurnoverList(x, y, color);
                let selfCount = turnoverList.length;
                if (selfCount > 0) {
                    let tempScore = calcScore(board, color, x, y);
                    if (tempScore > score) {
                        score = tempScore;
                        pos = { x, y };
                    }
                }
            }
        }
        return pos;
    }

    pos = search();

    // 石を置く
    board.putStone(pos.x, pos.y, color)
    // 盤面の表示を更新
    displayBoard();
    displayCounter();
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
            //let color = board.getStoneColor(w, h);
            let color = board.getStoneColorToBitBoard(w, h);
            if (color === 1) {
                newButton.textContent = '●';
                newButton.setAttribute('class', 'black');
            } else if (color === 2) {
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
            if (board.getStoneColor(j, i) !== 0) continue;
            let turnoverList = board.canTurnoverList(j, i, player);
            if (turnoverList.length > 0) {
                let newSpan = document.createElement('span');
                newSpan.setAttribute('class', 'number');
                newSpan.textContent = turnoverList.length;
                document.getElementById(`${i}-${j}`).appendChild(newSpan);
            }
        }
    }
}


const displayCounter = () => {
    blackCounter.textContent = board.black;
    whiteCounter.textContent = board.white;
}


let board = new Board();
let player = Math.floor(Math.random() * 2) + 1;
if (player === 2) {
    opponent(1);
    colorElement.textContent = '○';
};
displayBoard();
displayNumber();
displayCounter();

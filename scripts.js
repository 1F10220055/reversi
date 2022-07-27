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
    let putted = board.putStone(w, h, board.player);
    // 正しく処理できた場合
    if (putted) {
        // 盤面の表示を更新
        displayBoard();
        displayCounter();
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
            if (board.getStoneColor(x, y) !== 0) continue;
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
            if (board.getStoneColor(w, h) === 1) {
                newButton.textContent = '●';
                newButton.setAttribute('class', 'black');
            } else if (board.getStoneColor(w, h) === 2) {
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


const displayCounter = () => {
    blackCounter.textContent = board.black;
    whiteCounter.textContent = board.white;
}


let board = new Board(player = Math.floor(Math.random() * 2) + 1);
displayBoard();
displayNumber();
displayCounter();
if (board.player === 2) {
    opponent(1);
    colorElement.textContent = '○';
};

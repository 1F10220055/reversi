const board = document.getElementById('board');
const colorHTML = document.getElementById('color');

//  1->黒・2->白
const boardStatus = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0],
    [0, 0, 0, 1, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
]

let blackCount = 2;
let whiteCount = 2;

const isEnemy = (w, h, color) => {
    if (color === 1) {
        return boardStatus[h][w] === 2;
    } else if (color === 2) {
        return boardStatus[h][w] === 1;
    }
}

//  ひっくり返せるマスを返す関数
const turnover = (y, x, color) => {
    let result = [];
    const direction2turn = (x, y, direction) => {
        let turn = [];
        x += direction.x;
        y += direction.y;
        while (x < 8 && x >= 0 && y < 8 && y >= 0) {
            if (isEnemy(x, y, color)) {
                turn.push({ 'x': x, 'y': y });
                x += direction.x;
                y += direction.y;
            } else if (boardStatus[y][x] === color) {
                return turn;
            } else {
                break;
            }
        }
        return [];
    }
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) {
                continue;
            }
            let turn = direction2turn(x, y, { 'x': i, 'y': j });
            result = result.concat(turn);
        }
    }
    return result;
}

const canPut = (color) => {
    for (let h = 0; h < 8; h++) {
        for (let w = 0; w < 8; w++) {
            if (boardStatus[h][w] !== 0) continue;
            let result = turnover(h, w, color).length;
            if (result > 0) {
                return true;
            }
        }
    }
    return false;
}

const judge = () => {
    if (blackCount === 0 || whiteCount === 0) {
        alert(`${blackCount === 0 ? '白' : '黒'}の勝ち`);
        return true;
    } else if (blackCount + whiteCount === 64) {
        if (blackCount === whiteCount) {
            alert('引き分け');
        } else {
            if (blackCount > whiteCount) {
                alert(`${blackCount}対${whiteCount}で黒の勝ち`);
            } else {
                alert(`${blackCount}対${whiteCount}で白の勝ち`);
            }
        }
        return true;
    } else if (canPut(1) === false && canPut(2) === false) {
        if (blackCount === whiteCount) {
            alert('引き分け');
        } else {
            if (blackCount > whiteCount) {
                alert(`${blackCount}対${whiteCount}で黒の勝ち`);
            } else {
                alert(`${blackCount}対${whiteCount}で白の勝ち`);
            }
        }
        return true;
    }
    return false;
}

let turn = 1;
const handleClick = (h, w) => {
    if (boardStatus[h][w] !== 0) return;
    let result = turnover(h, w, turn);
    if (result.length === 0) return;
    boardStatus[h][w] = turn;
    turn === 1 ? blackCount++ : whiteCount++;
    for (let cell of result) {
        boardStatus[cell.y][cell.x] = turn;
        if (turn === 1) {
            blackCount++;
            whiteCount--;
        } else {
            whiteCount++;
            blackCount--;
        }
    }
    console.log(blackCount, whiteCount);
    generateBoard();
    if (judge()) return;
    if (canPut(turn === 1 ? 2 : 1)) {
        turn = turn === 1 ? 2 : 1;
        turn === 1 ? colorHTML.textContent = '●' : colorHTML.textContent = '○';
    } else {
        alert('置くことが出来るマスが存在しないため、ターンがスキップされます。')
    }
}

// Boardを生成する関数
const generateBoard = () => {
    board.innerHTML = '';
    for (let h = 0; h < 8; h++) {
        let newTbody = document.createElement('tbody');
        let newTr = document.createElement('tr');
        newTr.setAttribute('class', 'row');
        for (let w = 0; w < 8; w++) {
            let newTd = document.createElement('td');
            newTd.setAttribute('class', 'cell');
            let newButton = document.createElement('button');
            newButton.setAttribute('id', `${h}-${w}`);
            if (boardStatus[h][w] === 1) {
                newButton.textContent = '●';
                newButton.setAttribute('class', 'black');
            } else if (boardStatus[h][w] === 2) {
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
        board.appendChild(newTbody);
    }
}

generateBoard();
const board = document.getElementById('board');
const colorHTML = document.getElementById('color');
const cover = document.getElementById('cover');
const turn = Math.floor(Math.random() * 2) + 1;
let blackCount = 2;
let whiteCount = 2;

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

const isEnemy = (w, h, color) => {
    if (color === 1) {
        return boardStatus[h][w] === 2;
    } else if (color === 2) {
        return boardStatus[h][w] === 1;
    }
}

//  ひっくり返せるマスを返す関数
const canTurnover = (y, x, color) => {
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

const canPut = (h, w, color) => {
    let result = canTurnover(h, w, color).length;
    if (result > 0) {
        return true;
    }
    return false;
}

const skip = (color) => {
    for (let w = 0; w < 8; w++) {
        for (let j = 0; j < 8; j++) {
            if (boardStatus[j][w] !== 0) continue;
            if (canPut(j, w, color)) {
                return false;
            }
        }
    }
    return true;
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
    } else if (skip(1) === true && skip(2) === true) {
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

const opposite = (color) => {
    let cnt = 0;
    let pos;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (boardStatus[i][j] !== 0) continue;
            let result = canTurnover(i, j, color).length;
            if (result > cnt) {
                cnt = result;
                pos = { 'x': j, 'y': i };
            }
        }
    }
    if (cnt > 0) {
        if (turnover(pos.y, pos.x, color)) {
            if (judge()) return;
            if (skip(color === 1 ? 2 : 1)) {
                alert('置くことが出来るマスが存在しないため、ターンがスキップされます。')
                opposite(color);
            }
        }
    }
}

const handleClick = (h, w) => {
    if (boardStatus[h][w] !== 0) return;
    cover.style.display = 'block';
    if (turnover(h, w, turn)) {
        if (judge()) return;
        if (!skip(turn === 1 ? 2 : 1)) {
            opposite(turn === 1 ? 2 : 1);
        } else {
            alert('置くことが出来るマスが存在しないため、ターンがスキップされます。')
        }
    }
    cover.style.display = 'none';
}

const turnover = (h, w, color) => {
    let result = canTurnover(h, w, color);
    if (result.length === 0) return false;
    boardStatus[h][w] = color;
    if (color === 1) {
        blackCount++;
    } else {
        whiteCount++;
    }
    for (let cell of result) {
        boardStatus[cell.y][cell.x] = color;
        if (color === 1) {
            blackCount++;
            whiteCount--;
        } else {
            whiteCount++;
            blackCount--;
        }
    }
    console.log(blackCount, whiteCount);
    generateBoard();
    displayNumber();
    return true;
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

const displayNumber = () => {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (boardStatus[i][j] !== 0) continue;
            let result = canTurnover(i, j, turn);
            if (result.length > 0) {
                let newSpan = document.createElement('span');
                newSpan.setAttribute('class', 'number');
                newSpan.textContent = result.length;
                document.getElementById(`${i}-${j}`).appendChild(newSpan);
            }
        }
    }
}

generateBoard();
displayNumber();
if (turn === 2) {
    opposite(1);
    colorHTML.textContent = '○';
};
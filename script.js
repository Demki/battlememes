window.addEventListener("load", () => {
  const canvas = document.querySelector("canvas");
  const context = canvas.getContext("2d");
  canvas.addEventListener("mousemove", mouseMoved);
  canvas.addEventListener("click", mark(1));
  canvas.addEventListener("contextmenu", (ev) => { mark(-1)(ev); ev.preventDefault(); });
  window.requestAnimationFrame(frame(context, canvas));
});

function mark(d) {
  return (ev) => {
    if (mousePos.board > 0 && mousePos.x > 0 && mousePos.y > 0) {
      const { x, y } = mousePos;
      const key = JSON.stringify([x, y]);
      const board = marks.boards[mousePos.board - 1];
      const v = board.get(key) || 0;
      const newV = Math.max(Math.min(v + d, colors.max), colors.min);
      board.set(key, newV);
    }
  }
}

/** 
 * @param {CanvasRenderingContext2D} context 
 * @param {HTMLCanvasElement} canvas 
 */
function frame(context, canvas) {
  const f = (time) => {
    redraw(context, canvas);
    window.requestAnimationFrame(f);
  }
  return f;
}

const colors = {
  min: -2, max: 3,
  [-2]: "yellowgreen",
  [-1]: "#7070FF",
  [1]: "lightgrey",
  [2]: "red",
  [3]: "#420690",
}

const marks = {
  boards: [new Map(), new Map()]
}

let mousePos = {
  board: 0, x: 0, y: 0
};

/**
 * @param {MouseEvent} ev
 */
function mouseMoved(ev) {
  const { offsetX, offsetY } = ev;
  if (board1Offsets.x <= offsetX && offsetX <= board1Offsets.x + 330
    && board1Offsets.y <= offsetY && offsetY <= board1Offsets.y + 330) {
    mousePos.board = 1;
    mousePos.x = Math.floor((offsetX - board1Offsets.x) / 30);
    mousePos.y = Math.floor((offsetY - board1Offsets.y) / 30);
  }
  else if (board2Offsets.x <= offsetX && offsetX <= board2Offsets.x + 330
    && board2Offsets.y <= offsetY && offsetY <= board2Offsets.y + 330) {
    mousePos.board = 2;
    mousePos.x = Math.floor((offsetX - board2Offsets.x) / 30);
    mousePos.y = Math.floor((offsetY - board2Offsets.y) / 30);
  }
  else {
    mousePos.board = 0;
  }
  console.log(mousePos);
}

const board1Offsets = { x: 25, y: 30 }
const board2Offsets = { x: 445, y: 30 }

/** 
 * @param {CanvasRenderingContext2D} context 
 * @param {HTMLCanvasElement} canvas 
 */
function redraw(context, canvas) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawBoards(context);
  drawMarks(context);
}

/** 
 * @param {CanvasRenderingContext2D} context 
 */
function drawBoards(context) {
  context.strokeStyle = "white";
  context.beginPath();
  for (let i = 0; i < 12; ++i) {
    const xCoord = board1Offsets.x + 30 * i;
    context.moveTo(xCoord, board1Offsets.y);
    context.lineTo(xCoord, board1Offsets.y + 330);
  }
  for (let i = 0; i < 12; ++i) {
    const yCoord = board1Offsets.y + 30 * i;
    context.moveTo(board1Offsets.x, yCoord);
    context.lineTo(board1Offsets.x + 330, yCoord);
  }
  context.stroke();
  context.beginPath();
  for (let i = 0; i < 12; ++i) {
    const xCoord = board2Offsets.x + 30 * i;
    context.moveTo(xCoord, board2Offsets.y);
    context.lineTo(xCoord, board2Offsets.y + 330);
  }
  for (let i = 0; i < 12; ++i) {
    const yCoord = board2Offsets.y + 30 * i;
    context.moveTo(board2Offsets.x, yCoord);
    context.lineTo(board2Offsets.x + 330, yCoord);
  }
  context.stroke();
  highlight(context, board1Offsets, { x: 0, y: 0 }, "#b0b0b0a0");
  highlight(context, board2Offsets, { x: 0, y: 0 }, "#b0b0b0a0");
  context.font = "25px serif";
  context.fillStyle = "black";
  for (let i = 0; i < 10; ++i) {
    const t = context.measureText(i + 1);
    context.fillText(i + 1, board1Offsets.x + 15 - t.width / 2, board1Offsets.y + (i + 1) * 30 + 15 + t.actualBoundingBoxAscent / 2);
    context.fillText(i + 1, board2Offsets.x + 15 - t.width / 2, board2Offsets.y + (i + 1) * 30 + 15 + t.actualBoundingBoxAscent / 2);
  }
  for (let i = 0; i < 10; ++i) {
    const text = String.fromCharCode("A".charCodeAt(0) + i);
    const t = context.measureText(text);
    context.fillText(text, board1Offsets.x + (i + 1) * 30 + 15 - t.width / 2, board1Offsets.y + 15 + t.actualBoundingBoxAscent / 2);
    context.fillText(text, board2Offsets.x + (i + 1) * 30 + 15 - t.width / 2, board2Offsets.y + 15 + t.actualBoundingBoxAscent / 2);
  }

  switch (mousePos.board) {
    case 1:
      highlight(context, board1Offsets, mousePos, "#a0a0a050");
      break;
    case 2:
      highlight(context, board2Offsets, mousePos, "#a0a0a050");
      break;
    default:
      break;
  }
}

/** 
 * @param {CanvasRenderingContext2D} context 
 */
function highlight(context, { x: offsetX, y: offsetY }, { x, y }, color) {
  context.fillStyle = color;
  context.fillRect(offsetX + x * 30 + 1, offsetY + 1, 28, 328);
  context.fillRect(offsetX + 1, offsetY + y * 30 + 1, 328, 28);
}

/** 
 * @param {CanvasRenderingContext2D} context 
 */
function drawMarks(context) {
  for (let [xy, value] of marks.boards[0]) {
    if (value !== 0) {
      let [x, y] = JSON.parse(xy);
      context.fillStyle = colors[value];
      context.fillRect(board1Offsets.x + x * 30 + 2, board1Offsets.y + y * 30 + 2, 26, 26);
    }
  }

  for (let [xy, value] of marks.boards[1]) {
    if (value !== 0) {
      let [x, y] = JSON.parse(xy);
      context.fillStyle = colors[value];
      context.fillRect(board2Offsets.x + x * 30 + 2, board2Offsets.y + y * 30 + 2, 26, 26);
    }
  }
}
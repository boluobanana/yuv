

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const pointsTextarea: HTMLTextAreaElement = document.querySelector("#pointsTextarea");
const drawBtn = document.querySelector(".drawBtn");

drawBtn.addEventListener('click', draw);

function draw() {

  const points: [[number,number]] = JSON.parse(pointsTextarea.value);
  console.log(points);

  points.forEach( el => {
    const x = el[0];
    const y = el[1];

    ctx.beginPath();
    var radius = 2; // Arc radius
    var startAngle = 0; // Starting point on circle
    var endAngle = Math.PI * 2; // End point on circle

    ctx.arc(x, y, radius, startAngle, endAngle);

    ctx.fill();
  })

  for(let i = 0; i < points.length - 1; i++) {
    const color = `rgb(${255* Math.random()}, ${255 * Math.random()}, ${255* Math.random()})`;

    let realP = realGen(points[i], points[i+1], 10);
    let a = [realP[0], realP[1]];
    let b = [realP[2], realP[3]];
    console.log('origin:',points[i], ' a:', a, " b:", b);
    ctx.beginPath();
    ctx.fillStyle = color;
    var radius = 2; // Arc radius
    var startAngle = 0; // Starting point on circle
    var endAngle = Math.PI * 2; // End point on circle

    ctx.arc(points[i][0], points[i][1], radius, startAngle, endAngle);
    ctx.arc(a[0], a[1], radius, startAngle, endAngle);
    ctx.fillText('a', a[0], a[1]);
    ctx.arc(b[0], b[1], radius, startAngle, endAngle);
    ctx.fillText('b', b[0], b[1]);
    ctx.fill();
  }
}

function realGen(a: [number, number], b: [number, number], width: number) {
  // let alpha = Math.PI / 2 - Math.atan( (b[0] - a[0]) / (b[1] - a[1]) );
  let alpha = Math.PI / 2 - Math.atan(Math.abs((b[0] - a[0]) / (b[1] - a[1])));

  // 右下↘
  if (a[0] < b[0] && a[1] < b[1]) {
    console.log('右下');
    const x = width * Math.sin(alpha);
    const y = width * Math.cos(alpha);
    return [a[0] + x, a[1] - y, a[0] - x, a[1] + y];
  }

  // 左下 ↙
  if (a[0] > b[0] && a[1] < b[1]) {
    console.log('左下');
    const x = width * Math.sin(alpha);
    const y = width * Math.cos(alpha);
    return [a[0] + x, a[1] + y, a[0] - x, a[1] - y,];
  }

  // 左上 ↖
  if (a[0] > b[0] && a[1] > b[1]) {
    console.log('左上');
    const x = width * Math.sin(alpha);
    const y = width * Math.cos(alpha);
    return [a[0] - x, a[1] + y, a[0] + x, a[1] - y];
  }

  // 右上 ↗
  if (a[0] < b[0] && a[1] > b[1]) {
    console.log('右上');
    const x = width * Math.sin(alpha);
    const y = width * Math.cos(alpha);
    return [a[0] - x, a[1] - y, a[0] + x, a[1] + y];
  }

  // x1 == x2, y2 > y1 向下
  if (a[0] == b[0] && b[1] > a[1]) {
    // 返回 右 左
    console.log('向下');
    return [a[0] + width, a[1], a[0] - width, a[1]];
  }
  // x1 == x2, y2 < y1 向上
  if (a[0] == b[0] && b[1] < a[1]) {
    // 返回 左 右
    console.log('向上');
    return [a[0] - width, a[1], a[0] + width, a[1],];
  }

  // y1 == y2, x2 > x1 向右
  if (a[1] == b[1] && b[0] > a[0]) {
    // 返回 上下
    console.log('向右');
    return [a[0], a[1] - width, a[0], a[1] + width];
  }

  // y1 == y2, x2 < x1 向左
  if (a[1] == b[1] && b[0] < a[0]) {
    // 返回 上下
    console.log("向左");
    return [a[0], a[1] + width, a[0], a[1] - width];
  }
  // const wXSin = width * Math.sin(alpha);
  // const wXCos = width * Math.cos(alpha);
  // let cx = a[0] - wXSin;
  // let cy = a[1] - wXCos;
  // let dx = a[0] + wXSin;
  // let dy = a[1] + wXCos;

  // return [cx, cy, dx, dy];
  return [a[0], a[1], b[0], b[1]];
}

// [[33, 174], [37, 167], [104, 152], [127, 152], [146, 159]]
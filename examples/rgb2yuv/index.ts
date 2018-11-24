var rgbC: HTMLCanvasElement = document.querySelector('#rgbC');
var yC: HTMLCanvasElement = document.querySelector('#yC');
var uC: HTMLCanvasElement = document.querySelector('#uC');
var vC: HTMLCanvasElement = document.querySelector('#vC');
var input: HTMLInputElement = document.querySelector('input');

input.addEventListener('change', updateImageDisplay)

function updateImageDisplay(e) {
  var input = e.target;
  var curFile = input.files[0];
  if (!curFile) return;

  var image = new Image();
  image.src = window.URL.createObjectURL(curFile);
  image.onload = function () {
    renderImg(image, rgbC);
    let yuvData = coverToYUV(rgbC);

    resize(image, yC);
    resize(image, uC);
    resize(image, vC);
    renderWithData(yuvData.yData, yC);
    renderWithData(yuvData.uData, uC);
    renderWithData(yuvData.vData, vC);
  }
}

function coverToYUV(canvas:HTMLCanvasElement) {
  let ctx = canvas.getContext('2d');
  let w = canvas.width;
  let h = canvas.height;
  let data = ctx.getImageData(0, 0, w, h);
  let pixData = data.data;

  var yData = [], uData = [], vData =[];
  for (let i = 0; i < pixData.length; i = i + 4) {
    let r = pixData[i], g = pixData[i+1], b = pixData[i+2], a = pixData[i+3];

    let y = 0.299 * r + 0.587 * g + 0.114 * b;
    let u = 0.492 * (b - y);
    let v = 0.877 * (r - y);

    yData.push(y);
    yData.push(y);
    yData.push(y);
    yData.push(a);

    uData.push(u);
    uData.push(u);
    uData.push(u);
    uData.push(a);

    vData.push(v);
    vData.push(v);
    vData.push(v);
    vData.push(a);
  }

  return {
    yData: new ImageData(Uint8ClampedArray.from(yData), data.width, data.height),
    vData: new ImageData(Uint8ClampedArray.from(vData), data.width, data.height),
    uData: new ImageData(Uint8ClampedArray.from(uData), data.width, data.height)
  }
}

function renderImg(img :HTMLImageElement, canvas: HTMLCanvasElement) {
  resize(img, canvas);
  var ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
}

function renderWithData(data, canvas: HTMLCanvasElement) {
  let ctx = canvas.getContext('2d');
  ctx.putImageData(data, 0, 0);
}
function resize(img: HTMLImageElement, canvas: HTMLCanvasElement) {
  canvas.width = img.width;
  canvas.height = img.height;
}
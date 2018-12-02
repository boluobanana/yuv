

export function createShader(gl: WebGLRenderingContext, type, source):WebGLShader {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

export function createProgram(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string): WebGLProgram {
  var program = gl.createProgram();
  let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

export function resize(canvas: HTMLCanvasElement, w, h) {
  var realToCSSPixels = window.devicePixelRatio
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;

  var displayWidth = Math.floor(canvas.clientWidth * realToCSSPixels),
    displayHeight = Math.floor(canvas.clientHeight * realToCSSPixels);

  if (canvas.width != displayWidth ||
    canvas.height != displayHeight) {
    canvas.width = displayWidth
    canvas.height = displayHeight
  }
}

export function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2,
  ]), gl.STATIC_DRAW);
}

export function createTextures(gl, program, images) {

  let texs = images.map( (img, i) => {
    return createTexutre(gl, program, img, i);
  })

  texs.forEach((tex, i) => {
    var u_imageLocation = gl.getUniformLocation(program, `u_image${i}`);
    gl.uniform1i(u_imageLocation, i);  // texture unit 0
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(gl.TEXTURE_2D, tex);
  })
}

export function createTexutre(gl: WebGLRenderingContext, program, img:HTMLImageElement, index:number) {
  var texture1 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture1);

  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  // Upload the image into the texture.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  return texture1;
}

export function loadImages(urls, callback) {
  var images = [];
  var imagesToLoad = urls.length;

  // 每个图像加载完成后调用一次
  var onImageLoad = function () {
    --imagesToLoad;
    // 如果所有图像都加载完成就调用回调函数
    if (imagesToLoad == 0) {
      callback(images);
    }
  };

  for (var ii = 0; ii < imagesToLoad; ++ii) {
    var image = loadImage(urls[ii], onImageLoad);
    images.push(image);
  }
}

function loadImage(url, callback) {
  var image = new Image();
  image.src = url;
  image.onload = callback;
  return image;
}
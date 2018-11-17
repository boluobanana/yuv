var gl:WebGLRenderingContext;
let canvas: HTMLCanvasElement;

function main() {
  canvas = document.querySelector('#canvas');
  gl = canvas.getContext('webgl');


  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices))
}

function render() {

}
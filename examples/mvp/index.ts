import { createProgram, resize } from '../utils';
import { vertex, fragment } from './shader';

main();

function main() {
  const canvas = document.querySelector('canvas');
  const gl = canvas.getContext('webgl');

  const program = createProgram(gl, vertex, fragment);


  // 向webgl去获取一个地址
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

  console.log(positionAttributeLocation);

  var positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [
    0, 0,
    0, 0.5,
    0.5, 0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  resize(canvas, 500, 500);

  // 设置窗口大小
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  // 打开当前position的attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // 绑定position的arrayBuffer
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 表示每一次计算后，需要偏移的量。0 表示数据是紧挨着的，1 表示数据读取后跳过一位在读取
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);

  // 真正的绘画
  const primitiveType = gl.TRIANGLES;
  offset = 0;
  const count = 3;
  gl.drawArrays(primitiveType, offset, count);
}

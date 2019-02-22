import { createProgram, resize } from '../utils';
import { vertex, fragment } from './shader';

main();

function main() {
  const canvas = document.querySelector('canvas');
  const gl = canvas.getContext('webgl');

  const program = createProgram(gl, vertex, fragment);

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

  const positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [
    0, 0,
    0, 1,
    1, 0,
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

  // 告诉attribute 如何去读取buffer的数据
  const size = 2;          // 每数据的大小
  const type = gl.FLOAT;   // 数据类型
  const normalize = false; // 是否需要归一数据

  // 每次数据读取后需要偏移 stride * sizeof(type)
  const stride = 0;
  let offset = 0;        // 起始的偏移量
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);

  // 真正的绘画
  const primitiveType = gl.TRIANGLES;
  offset = 0;
  const count = 3;
  gl.drawArrays(primitiveType, offset, count);
}

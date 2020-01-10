import { createProgram, resize } from '../utils';
import { vertex, fragment} from './shader';

interface GLData {
  location: number;
  buffer: WebGLBuffer;
  data: number[];
  size?: number;
  normalize?: boolean;
  stride?: number;
  offset?: number;
  type?: number;
}

class Comet {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;

  attrs: GLData[];
  cometData: GLData;
  uniforms: any;

  points: number[][] = [];
  headSize = 10;
  tailSize = 4;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl');
    var program = createProgram(gl, vertex, fragment);

    this.gl = gl;
    this.canvas = canvas;
    this.program = program;

    this.cometData = {
      location: gl.getAttribLocation(program, "a_comet_position"),
      buffer: gl.createBuffer(),
      data: [],
    };

    this.attrs = [this.cometData];

    this.uniforms = {
      'u_resolution': {
        location: gl.getUniformLocation(program, "u_resolution")
      }
    }

    console.log(canvas.width, canvas.height);

    canvas.addEventListener('mousemove', e => {
      let x = e.clientX;
      let y = e.clientY;
      this.points.push([x,y]);
    })
  }

  render() {
    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);


    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    this.genDataAndBindData();

    if (this.points.length > 1) {
      this.points.shift();
    }
    // Tell it to use our program (pair of shaders)
    gl.useProgram(this.program);

    this.bindBuffer();
    this.setUniform();

    // draw
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = this.cometData.data.length / 2;
    gl.drawArrays(primitiveType, offset, count);

    requestAnimationFrame(this.render.bind(this));
  }

  setUniform() {
    let { gl, uniforms } = this;
    gl.uniform2f(uniforms['u_resolution'].location, gl.canvas.width, gl.canvas.height);
  }

  genDataAndBindData() {
    let gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cometData.buffer);
    let tail = this.points[0] || [0,0];
    let head = this.points[this.points.length - 1] || [100,100];
    let headSize = this.headSize;

    // console.log(tail, head, headSize);
    let circly = this.genCircly(head[0],head[1], headSize, 16);
    this.cometData.data = [
      ...circly,

      // x,y,// 左上
      // 10 + x, 0 + y, // 右上
      // 0 + x, 10 + y, // 右下
      // 0 + x, 10 + y, //
      // 10 + x, 0 + y,
      // 10 + x, 10 + y,
      tail[0], tail[1],
      head[0] + headSize, head[1] + headSize,
      head[0], head[1]
    ];
    // console.log(this.cometData.data);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cometData.data), gl.STATIC_DRAW);
  }

  bindBuffer() {
    let {
      gl, attrs
    } = this;
    // console.log(attribs);
    for (let k in attrs) {
      let attr = attrs[k];

      gl.enableVertexAttribArray(attr.location);
      gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
      gl.vertexAttribPointer(attr.location, attr.size || 2, attr.type || gl.FLOAT, attr.normalize || false, attr.stride || 0, attr.offset || 0)
    }
  }

  genCircly(x:number ,y: number ,radius: number, segments: number) {
    const vertices = [];
    for (let s = 0; s <= segments; s++) {

      var segment = s / segments * Math.PI * 2;

      // vertex

      let pos_x = radius * Math.cos(segment);
      let pos_y = radius * Math.sin(segment);

      // vertices.push(x,y);
      vertices.push(x - pos_x, y - pos_y);
    }

    // console.log(vertices);
    for (let i = 0; i < vertices.length - 1; i = i + 6) {
      let nx = vertices[i+2] || vertices[0];
      let ny = vertices[i+3] || vertices[1];

      vertices.splice(i+2, 0, x,y, nx,ny);

    }

    // console.log(vertices);

    return vertices;
  }
}

main();

function main() {
  const canvas = document.querySelector('canvas');
  const comet = new Comet(canvas);

  comet.render();
}
// [80,100,  90,90,  110,90,  120,100, 90,110]
// 80, 100,
//   90, 90,
//   100, 100,

//   100, 100,
//   90, 90,
//   110, 90,

//   110, 90,
//   120, 100,
//   100, 100,

//   100, 100,
//   120, 100,
//   110, 110,

//   110, 110,
//   90, 110,
//   100, 100,

//   100, 100,
//   90, 110,
//   80, 100

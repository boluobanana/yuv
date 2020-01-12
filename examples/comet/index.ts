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
  textureCanvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;

  attrs: GLData[];
  cometData: GLData;
  cometUV: GLData;
  uniforms: any;

  points: [number, number][] = [];
  headSize = 10;
  tailSize = 4;
  weakSpeed = 0.02;

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
    this.cometUV = {
      location: gl.getAttribLocation(program, 'a_comet_uv'),
      buffer: gl.createBuffer(),
      data: [],
      size: 1,
    }

    console.log(this.cometUV);
    this.attrs = [this.cometData, this.cometUV];

    this.uniforms = {
      'u_resolution': {
        location: gl.getUniformLocation(program, "u_resolution")
      }
    }
    // console.log(canvas.width, canvas.height);

    canvas.addEventListener('mousemove', e => {
      let x = e.clientX;
      let y = e.clientY;

      this.points.push([x, y]);
    });

    // this.genTexture();
    // this.bindTexture();
  }

  render() {
    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);


    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    this.genDataAndBindData();
    const len = this.points.length;
    if (len > 1) {

      let removeCount = Math.floor(len * this.weakSpeed);
      this.points.splice(0, removeCount > 1 ? removeCount : 1 );
    }

    // console.log(len, len * this.weakSpeed);

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
    let tailSize = this.tailSize;

    // console.log(tail, head, headSize);
    let circly = this.genCircly(head[0], head[1], headSize, 16);
    let cometTail = this.genTrack(this.points, headSize, tailSize);
    let x = head[0];
    let y = head[1];

    this.cometData.data = [
      ...circly,
      ...cometTail,
      // x,y,// 左上
      // 40 + x, 0 + y, // 右上
      // 0 + x, 40 + y, // 右下
      // 0 + x, 40 + y, //
      // 40 + x, 0 + y,
      // 40 + x, 40 + y,
      // tail[0], tail[1],
      // head[0] + headSize, head[1] + headSize,
      // head[0], head[1]
    ];
    // console.log(this.cometData.data);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cometData.data), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.cometUV.buffer);
    this.cometUV.data = [];
    for (let i = 0; i < circly.length / 2; i++) {
      this.cometUV.data.push(1);
    }

    let dataLen = cometTail.length / 2;
    for (let i = 0; i < dataLen; i++) {
      this.cometUV.data.push( i / dataLen);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cometUV.data), gl.STATIC_DRAW);

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

  genTrack(points: [number, number][], maxWidth: number, minHight: number) {
    const len = points.length;
    const realPoints = [];
    let realGen = this.realGen;

    for (let i = 0; i < len - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const width = (maxWidth - minHight) * i / len + minHight;
      const newPoints = realGen(a, b, width);

      realPoints.push(newPoints[0]);
      realPoints.push(newPoints[1]);
      realPoints.push(newPoints[2]);
      realPoints.push(newPoints[3]);
    }

    for (let i = 0; i < realPoints.length - 1; i = i + 6) {
      let nx1 = realPoints[i + 2];
      let ny1 = realPoints[i + 3];

      let nx2 = realPoints[i + 4];
      let ny2 = realPoints[i + 5];

      if (nx1 !== undefined && nx2 !== undefined && ny1 !== undefined && ny2 !== undefined) {
        realPoints.splice(i+2, 0, nx1,ny1, nx2,ny2);
      }

    }

    return realPoints;
  }

  realGen(a: [number, number], b: [number, number], width: number) {
    let alpha = Math.PI / 2 - Math.atan( Math.abs((b[0] - a[0]) / (b[1] - a[1])) );
    const wXSin = width * Math.sin(alpha);
    const wXCos = width * Math.cos(alpha);
    let cx = a[0] - wXSin;
    let cy = a[1] - wXCos;
    let dx = a[0] + wXSin;
    let dy = a[1] + wXCos;

    return [cx, cy, dx, dy];
  }


  genTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    this.textureCanvas = canvas;
    const ctx = canvas.getContext('2d');
    const grd = ctx.createLinearGradient(0, 0, 100, 0);
    grd.addColorStop(0, "rgba(0,0,0,0)");
    grd.addColorStop(1, "rgba(0,0,0,1.0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 100, 100);

    document.body.append(canvas);
    return canvas;
  }

  bindTexture() {
    const gl = this.gl;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textureCanvas);
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

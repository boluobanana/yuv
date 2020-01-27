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
  weakSpeed = 0.04;

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

    this.attrs = [this.cometData, this.cometUV];

    this.uniforms = {
      'u_resolution': {
        location: gl.getUniformLocation(program, "u_resolution")
      }
    }

    canvas.addEventListener('mousemove', e => {
      let x = e.clientX;
      let y = e.clientY;

      let now = x*x + y * y;
      let len = this.points.length;

      if (len > 0) {
        const last = this.points[len-1];
        if (Math.abs(last[0] * last[0] + last[1] * last[1] - now) < 2048) {
          return;
        }
      }
      // console.log([x,y]);
      this.points.push([x, y]);
    });

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
    // var primitiveType = gl.POINTS;
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
    let head = this.points[this.points.length - 1] || [100,100];

    let headSize = this.headSize;
    let tailSize = this.tailSize;

    let circly = this.genCircly(head[0], head[1], headSize, 16);
    let cometTail = this.genTrack(this.points, headSize, tailSize);
    // let cometTail = this.genCirclyTrack(this.points, headSize, tailSize);
    let a = [20, 40], b = [20, 20], c = [40, 40],
      d = [40,20], f = [60,33], e = [56, 52],
      g= [58,62], h = [78,58], i = [58,78], j = [78,78],
      k = [56,85], l = [78,89];

    this.cometData.data = [
      ...circly,
      ...cometTail,
      // 104.63785701582992, 104.01642717412919, // a
      // 105.36214298417008, 111.98357282587081, // b
      // 118.03278907045436, 102.93442185909129, // c

      // 105.36214298417008, 111.98357282587081, // b
      // 118.03278907045436, 102.93442185909129, // c
      // 113.96721092954564, 111.06557814090871, // d

      // 118.03278907045436, 102.93442185909129, // c
      // 113.96721092954564, 111.06557814090871, // d
      // 124.27672375890887, 105.44655248218224, // e

      // 113.96721092954564, 111.06557814090871, // d
      // 124.27672375890887, 105.44655248218224, // e
      // 119.72327624109113, 114.55344751781776, // f

      // 124.27672375890887, 105.44655248218224, // e
      // 119.72327624109113, 114.55344751781776, // f
      // 130.5206584473634, 107.9586831052732, // g

      // 119.72327624109113, 114.55344751781776, // f
      // 130.5206584473634, 107.9586831052732, // g
      // 125.4793415526366, 118.0413168947268, // h

      // 130.5206584473634, 107.9586831052732, // g
      // 125.4793415526366, 118.0413168947268, // h
      // 138.82718900382963, 112.13824879693628, // i

      // 125.4793415526366, 118.0413168947268, // h
      // 138.82718900382963, 112.13824879693628, // i
      // 129.17281099617037, 119.86175120306372, // j

      // 138.82718900382963, 112.13824879693628, // i
      // 129.17281099617037, 119.86175120306372, // j
      // 142.75690016434586, 116.24309983565414, // k

      // 129.17281099617037, 119.86175120306372, // j
      // 142.75690016434586, 116.24309983565414, // k
      // 133.24309983565414, 125.75690016434586, // l

      // 142.75690016434586, 116.24309983565414, // k
      // 133.24309983565414, 125.75690016434586, // l
      // 148.89951489491284, 122.70016170169572, // m

      // 133.24309983565414, 125.75690016434586, // l
      // 148.89951489491284, 122.70016170169572, // m
      // 135.10048510508716, 127.29983829830428, // n

      // 148.89951489491284, 122.70016170169572, // m
      // 135.10048510508716, 127.29983829830428, // n
      // 151.73960513226004, 129.89434212396284, // o

      // 135.10048510508716, 127.29983829830428, // n
      // 151.73960513226004, 129.89434212396284, // o
      // 136.26039486773996, 132.10565787603716, // p

      // 151.73960513226004, 129.89434212396284, // o
      // 136.26039486773996, 132.10565787603716, // p
      // 137.40615787508713, 134.49514978850175, // q

      // 136.26039486773996, 132.10565787603716, // p
      // 137.40615787508713, 134.49514978850175, // q
      // 152.59384212491287, 141.50485021149825, // r

      // 137.40615787508713, 134.49514978850175, // q
      // 152.59384212491287, 141.50485021149825, // r
      // 131.5871882868083, 146.05812552453887, // s
      // 152.59384212491287, 141.50485021149825,
      // 131.5871882868083, 146.05812552453887,
      // 146.4128117131917, 155.94187447546113,
      // 131.5871882868083,
      // 146.05812552453887,
      // 146.4128117131917,
      // 155.94187447546113
      // ...a,...b,...c,
      // ...c,...b,...d,
      // ...d,...f,...c,
      // ...c,...f,...e,
      // ...e,...f,...g,
      // ...g,...f,...h,
      // ...h, ...j, ...g,
      // ...g, ...j, ...i,
      // ...i, ...j, ...k,
      // ...k, ...j, ...l,
    ];
    // console.log(this.cometData.data.length % 3);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cometData.data), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.cometUV.buffer);
    this.cometUV.data = [];
    for (let i = 0; i < circly.length / 2; i++) {
      this.cometUV.data.push(1);
    }

    let dataLen = cometTail.length / 2;
    for (let i = 0; i < dataLen; i++) {
      // this.cometUV.data.push( i / dataLen);
      this.cometUV.data.push( 1);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cometUV.data), gl.STATIC_DRAW);

  }

  bindBuffer() {
    let {
      gl, attrs
    } = this;

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

      let pos_x = radius * Math.cos(segment);
      let pos_y = radius * Math.sin(segment);

      vertices.push(x - pos_x, y - pos_y);
    }

    for (let i = 0; i < vertices.length - 1; i = i + 6) {
      let nx = vertices[i+2] || vertices[0];
      let ny = vertices[i+3] || vertices[1];

      vertices.splice(i+2, 0, x,y, nx,ny);

    }

    return vertices;
  }

  genTrack(points: [number, number][], maxWidth: number, minHight: number) {
    const len = points.length;
    const realPoints = [];
    let realGen = this.realGen;

    if (len < minHight) {
      return [];
    }
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


    // let v = [];
    // for (let i = 0; i < realPoints.length - 1; i = i+16) {
    //   let ax = realPoints[0 + i], ay = realPoints[1+i];
    //   let bx = realPoints[2+i], by = realPoints[3+i];
    //   let cx = realPoints[4+i], cy = realPoints[5+i];
    //   let dx = realPoints[6+i], dy = realPoints[7+i];
    //   let ex = realPoints[8+i], ey = realPoints[9+i];
    //   let fx = realPoints[10+i], fy = realPoints[11+i];
    //   let gx = realPoints[12+i], gy = realPoints[13+i];
    //   let hx = realPoints[14+i], hy = realPoints[15+i];
    //   let ix = realPoints[16+i], iy = realPoints[17+i];
    //   let jx = realPoints[18+i], jy = realPoints[19+i];

    //   v.push(ax,ay, bx,by,cx,cy);
    //   v.push(cx,cy, bx,by,dx,dy);
    //   v.push(dx,dy, fx,fy,cx,cy);
    //   v.push(cx,cy, fx,fy,ex,ey);
    //   v.push(ex,ey, fx,fy,gx,gy);
    //   v.push(gx,gy, fx,fy,hx,hy);
    //   v.push(hx,hy, jx,jy,gx,gy);
    //   v.push(gx,gy, jx,jy,ix,iy);
    // }

    return realPoints;
  }

  realGen(a: [number, number], b: [number, number], width: number) {
    // let alpha = Math.PI / 2 - Math.atan( (b[0] - a[0]) / (b[1] - a[1]) );
    let alpha = Math.PI / 2 - Math.atan( Math.abs((b[0] - a[0]) / (b[1] - a[1])) );

    // 右下↘
    if (a[0] < b[0] && a[1] < b[1]) {
      console.log('右下');
      const x = width * Math.sin(alpha);
      const y = width * Math.cos(alpha);
      return[a[0] + x, a[1] - y, a[0] - x, a[1] + y];
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
    if (a[1] == b[1] && b[0] > b[1]) {
      // 返回 上下
      console.log('向右');
      return [ a[0], a[1] - width, a[0], a[1] + width];
    }

    // y1 == y2, x2 < x1 向左
    if (a[1] == b[1] && b[0] < b[1]) {
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
    return [a[0],a[1], b[0], b[1]];
  }

  genCirclyTrack(points: [number, number][], maxWidth: number, minHight: number) {
    const len = points.length;
    let realPoints = [];
    if (points.length <= maxWidth) {
      return [];
    }

    for (let i = 0; i< len; i++) {
      let p = points[i];
      const radius = (maxWidth - minHight) * i / len + minHight;
      let vs = this.genCircly(p[0], p[1], radius, 8);
      realPoints = [...realPoints, ...vs];
    }

    return realPoints;
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

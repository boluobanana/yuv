

import Mesh from './mesh';

export class Tail extends Mesh {

  readPoints: [number, number][] = [];
  headSize = 10;
  tailSize = 4;
  weakSpeed = 0.00002;

  constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
    super(gl, program);

  }

  update(x:number, y:number) {
    let now = x * x + y * y;
    let len = this.readPoints.length;

    if (len > 0) {

      const last = this.readPoints[len - 1];
      if (Math.abs(last[0] * last[0] + last[1] * last[1] - now) < 2048) {
        return;
      }
    }

    this.readPoints.push([x,y]);
  }

  render(fn: Function) {
    super.render(fn);
    this.weak();
  }

  genData() {

    let headSize = this.headSize;
    let tailSize = this.tailSize;

    const {vertices: cometTail, indices } = this.genTrack([...this.readPoints], headSize, tailSize);

    this.setPositionData(cometTail);
    this.setIndices(indices);

    let dataLen = indices.length;

    let opacityData = [];
    let zIndexData = [];

    for (let i = 0; i < dataLen; i++) {
      opacityData.push(i / dataLen);
      zIndexData.push(0.5);
    }

    this.setOpacityData(opacityData);
    this.setZIndexData(zIndexData);
  }

  weak() {
    const len = this.readPoints.length;
    if (len > 1) {
      let removeCount = Math.floor(len * this.weakSpeed);
      this.readPoints.splice(0, removeCount > 1 ? removeCount : 1);
    }
  }

  genTrack(points: [number, number][], maxWidth: number, minHight: number) {
    let len = points.length;
    const realPoints = [];
    let realGen = this.realGen;

    if (len < minHight) {
      return {
        vertices: [],
        indices: [],
      };
    }
    if (len > 2) {
      // 衍生一个点
      let a = points[len - 2];
      let b = points[len - 1];
      let b_a_x = b[0] - a[0];
      let b_a_y = b[1] - a[1];

      let expandSize = 0.2;

      let c: [number, number] = [b[0] + b_a_x * expandSize, b[1] + b_a_y * expandSize];
      len = len + 1;
      points.push(c);
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

    // for (let i = 0; i < realPoints.length - 1; i = i + 6) {
    //   let nx1 = realPoints[i + 2];
    //   let ny1 = realPoints[i + 3];

    //   let nx2 = realPoints[i + 4];
    //   let ny2 = realPoints[i + 5];

    //   if (nx1 !== undefined && nx2 !== undefined && ny1 !== undefined && ny2 !== undefined) {
    //     realPoints.splice(i + 2, 0, nx1, ny1, nx2, ny2);
    //   }
    // }
    let indices = [];

    for (let i = 0; i < (realPoints.length / 2) - 1; i = i + 2) {
      const a = i;
      const b = i + 1;
      const c = i + 2;
      const d = i + 3;

      if ( d < (realPoints.length / 2) ) {
        indices.push(a, b, c);
        indices.push(b, c, d);
      }
    }

    return {
      vertices: realPoints,
      indices,
    };
  }

  realGen(a: [number, number], b: [number, number], width: number) {
    // let alpha = Math.PI / 2 - Math.atan( (b[0] - a[0]) / (b[1] - a[1]) );
    let alpha = Math.PI / 2 - Math.atan(Math.abs((b[0] - a[0]) / (b[1] - a[1])));

    // 右下↘
    if (a[0] < b[0] && a[1] < b[1]) {
      const x = width * Math.sin(alpha);
      const y = width * Math.cos(alpha);
      return [a[0] + x, a[1] - y, a[0] - x, a[1] + y];
    }

    // 左下 ↙
    if (a[0] > b[0] && a[1] < b[1]) {
      const x = width * Math.sin(alpha);
      const y = width * Math.cos(alpha);
      return [a[0] + x, a[1] + y, a[0] - x, a[1] - y,];
    }

    // 左上 ↖
    if (a[0] > b[0] && a[1] > b[1]) {
      const x = width * Math.sin(alpha);
      const y = width * Math.cos(alpha);
      return [a[0] - x, a[1] + y, a[0] + x, a[1] - y];
    }

    // 右上 ↗
    if (a[0] < b[0] && a[1] > b[1]) {
      const x = width * Math.sin(alpha);
      const y = width * Math.cos(alpha);
      return [a[0] - x, a[1] - y, a[0] + x, a[1] + y];
    }

    // x1 == x2, y2 > y1 向下
    if (a[0] == b[0] && b[1] > a[1]) {
      // 返回 右 左
      return [a[0] + width, a[1], a[0] - width, a[1]];
    }
    // x1 == x2, y2 < y1 向上
    if (a[0] == b[0] && b[1] < a[1]) {
      // 返回 左 右
      return [a[0] - width, a[1], a[0] + width, a[1],];
    }

    // y1 == y2, x2 > x1 向右
    if (a[1] == b[1] && b[0] > a[0]) {
      // 返回 上下
      return [a[0], a[1] - width, a[0], a[1] + width];
    }

    // y1 == y2, x2 < x1 向左
    if (a[1] == b[1] && b[0] < a[0]) {
      // 返回 上下
      return [a[0], a[1] + width, a[0], a[1] - width];
    }

    return [a[0], a[1], b[0], b[1]];
  }
}
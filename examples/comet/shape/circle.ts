

import Mesh from './mesh';

export class Circle extends Mesh {

  origin: [number, number] = [0,0];
  size: number = 4;

  constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
    super(gl, program);

  }

  update(x: number, y: number) {
    this.origin = [x, y];
  }
  setSize(v: number) {
    this.size = v;
  }

  genData() {
    const {origin, size} = this;

    let circly = this.genCircly(origin[0], origin[1], size, 16);

    this.setPositionData(circly);

    const opacityData = [];
    const zIndexData = [];

    for (let i = 0; i < circly.length / 2; i++) {
      opacityData.push(1.0);
      zIndexData.push(1.0);
    }

    this.setOpacityData(opacityData);
    this.setZIndexData(zIndexData);
  }

  genCircly(x: number, y: number, radius: number, segments: number) {
    const vertices = [];
    for (let s = 0; s <= segments; s++) {

      var segment = s / segments * Math.PI * 2;

      let pos_x = radius * Math.cos(segment);
      let pos_y = radius * Math.sin(segment);

      vertices.push(x - pos_x, y - pos_y);
    }

    for (let i = 0; i < vertices.length - 1; i = i + 6) {
      let nx = vertices[i + 2] || vertices[0];
      let ny = vertices[i + 3] || vertices[1];

      vertices.splice(i + 2, 0, x, y, nx, ny);

    }

    return vertices;
  }

  genCirclyTrack(points: [number, number][], maxWidth: number, minHight: number) {
    const len = points.length;
    let realPoints = [];
    if (points.length <= maxWidth) {
      return [];
    }

    for (let i = 0; i < len; i++) {
      let p = points[i];
      const radius = (maxWidth - minHight) * i / len + minHight;
      let vs = this.genCircly(p[0], p[1], radius, 8);
      realPoints = [...realPoints, ...vs];
    }

    return realPoints;
  }
}
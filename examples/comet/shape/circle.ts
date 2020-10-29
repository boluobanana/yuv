

import Mesh from './mesh';

export class Circle extends Mesh {

  origin: [number, number] = [40,40];
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

    let {vertices: circly, indices } = this.genCircly(origin[0], origin[1], size, 16);
    this.setPositionData(circly);
    this.setIndices(indices);

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
    const vertices = [x,y];
    for (let s = 0; s <= segments; s++) {

      var segment = s / segments * Math.PI * 2;

      let pos_x = radius * Math.cos(segment);
      let pos_y = radius * Math.sin(segment);

      vertices.push(x - pos_x, y - pos_y);
    }

    let indices = [];

    for (let i = 0; i < (vertices.length / 2) - 1; i = i + 1) {
      indices.push(0);
      indices.push(i);
      indices.push(i+1);
    }

    return {
      vertices,
      indices
    };
  }

  // genCirclyTrack(points: [number, number][], maxWidth: number, minHight: number) {
  //   const len = points.length;
  //   let realPoints = [];
  //   if (points.length <= maxWidth) {
  //     return [];
  //   }

  //   for (let i = 0; i < len; i++) {
  //     let p = points[i];
  //     const radius = (maxWidth - minHight) * i / len + minHight;
  //     let vs = this.genCircly(p[0], p[1], radius, 8);
  //     realPoints = [...realPoints, ...vs];
  //   }

  //   return realPoints;
  // }
}
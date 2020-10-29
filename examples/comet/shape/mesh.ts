import { GLData } from '../index';

export default abstract class Mesh {
  position: GLData;
  zIndex: GLData;
  opacity: GLData;
  indicesData: GLData;
  attrs: GLData[];

  gl: WebGLRenderingContext;
  program: WebGLProgram;

  constructor(gl: WebGLRenderingContext, program: WebGLProgram   ) {
    this.gl = gl;
    this.program = program;

    this.position = {
      location: gl.getAttribLocation(program, "a_comet_position"),
      buffer: gl.createBuffer(),
      data: [],
    };

    this.zIndex = {
      location: gl.getAttribLocation(program, "a_comet_z"),
      buffer: gl.createBuffer(),
      data: [],
      size: 1,
    };

    this.opacity = {
      location: gl.getAttribLocation(program, "a_comet_opacity"),
      buffer: gl.createBuffer(),
      data: [],
      size: 1,
    };

    this.indicesData = {
      buffer: gl.createBuffer(),
      data: [],
    };

    this.attrs = [this.indicesData, this.position, this.zIndex, this.opacity,];

  }

  abstract update(x: number, y: number);
  abstract genData();

  render(fn: Function) {
    const gl = this.gl;
    this.genData();
    if (this.position.data.length === 0) {
      return;
    }

    this.bindBuffer();
    this.bindBufferData();

    gl.useProgram(this.program);


    fn();

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = this.indicesData.data.length;
    var indexType = gl.UNSIGNED_SHORT;

    gl.drawElements(primitiveType, count, indexType, offset);

    // gl.drawArrays(primitiveType, offset, count);

  }

  bindBufferData() {
    let gl = this.gl;

    this.attrs.forEach(attr => {

      if (attr.location !== undefined) {
        gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attr.data), gl.STATIC_DRAW);
      } else {
        // console.log('att', attr.data);
        // for indices
        gl.bufferData(
          gl.ELEMENT_ARRAY_BUFFER,
          new Uint16Array(attr.data),
          gl.STATIC_DRAW
      );
      }
    })
  }

  bindBuffer() {
    let {
      gl, attrs
    } = this;

    for (let k in attrs) {
      let attr = attrs[k];

      if (attr.location !== undefined) {
        gl.enableVertexAttribArray(attr.location);
        gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
        gl.vertexAttribPointer(attr.location, attr.size || 2, attr.type || gl.FLOAT, attr.normalize || false, attr.stride || 0, attr.offset || 0)
      } else {
        // for indices
        // make this buffer the current 'ELEMENT_ARRAY_BUFFER'
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, attr.buffer);
       }
    }
  }

  setPositionData(d: number[]) {
    this.position.data = d;
  }

  setOpacityData(d: number[]) {
    this.opacity.data = d;
  }

  setZIndexData(d: number[]) {
    this.zIndex.data = d;
  }

  setIndices(d: number[]) {
    this.indicesData.data = d;
  }
}
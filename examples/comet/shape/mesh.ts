import { GLData } from '../index';

export default abstract class Mesh {
  position: GLData;
  zIndex: GLData;
  opacity: GLData;
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

    this.attrs = [this.position, this.zIndex, this.opacity];

  }

  abstract update(x: number, y: number);
  abstract genData();

  render(fn: Function) {
    const gl = this.gl;
    this.genData();
    if (this.position.data.length === 0) {
      return;
    }
    this.bindBufferData();

    gl.useProgram(this.program);
    this.bindBuffer();
    fn();

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = this.position.data.length / 2;
    gl.drawArrays(primitiveType, offset, count);

  }

  bindBufferData() {
    let gl = this.gl;

    this.attrs.forEach(attr => {
      gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attr.data), gl.STATIC_DRAW);
    })

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

  setPositionData(d: number[]) {
    this.position.data = d;
  }

  setOpacityData(d: number[]) {
    this.opacity.data = d;
  }

  setZIndexData(d: number[]) {
    this.zIndex.data = d;
  }

}
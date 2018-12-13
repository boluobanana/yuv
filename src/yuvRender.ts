import { createProgram, resize } from './utils';
import { vertex, fragment } from './shader';
import attributes, {Attributes} from './attributes';

export interface YUVOption {
  src: string;
  canvas: HTMLCanvasElement
}

export default class YUVRender {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  attributes: any;
  uniformSetters: any;
  attribSetters: any;
  texture: WebGLTexture;
  attribs: Attributes;
  uniforms: any;
  enabled = true;
  fps = 25;
  fpsCount = 0;

  constructor(opt: YUVOption) {
    this.canvas = opt.canvas;
    this.gl = this.canvas.getContext('webgl');
    this.program = createProgram(this.gl, vertex, fragment);

    this.resize();
    this.initUniform();
    this.initTexture();
    this.initAttributes();
  }

  render() {
    requestAnimationFrame(this.render.bind(this));
    if (!this.enabled) return;
    if (this.fpsCount > 60 / this.fps) {
      this.fpsCount = 0;
      return
    }
    this.fpsCount += 1;

    let gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    this.cleanBuffer();
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);
    this.initAttributes();

    this.renderTexture();

    this.renderAttributes();
    this.bindBuffer();
    this.setUniform();

    var offset = 0;
    var count = 6;
    gl.drawArrays(gl.TRIANGLES, offset, count);
  }

  resize(w?: number, h?: number) {
    resize(this.canvas, 360, 180);
  }

  initAttributes() { 

    let {
      gl, program
    } = this;
    let attribs = this.attribs = Object.assign({}, attributes);

    for (let k in attribs) {
      let attr = attribs[k];
      attr.location = gl.getAttribLocation(program, k);
      attr.buffer = gl.createBuffer();

    }
    return attribs;
  }

  renderAttributes() {
    let {
      gl, attribs
    } = this;

    for (let k in attribs) {
      let attr = attribs[k];

      gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, attr.bufferSource, gl.STATIC_DRAW)
    }
  }

  initUniform() {
    let {
      gl, program
    } = this;

    this.uniforms = {
      'u_resolution': {
        location: gl.getUniformLocation(program, "u_resolution")
      }
    }
  }

  setUniform() {
    let { gl, uniforms} = this;
    gl.uniform2f(uniforms['u_resolution'].location, gl.canvas.width, gl.canvas.height);
  }

  bindBuffer() {
    let {
      gl, attribs
    } = this;
    // console.log(attribs);
    for (let k in attribs) {
      let attr = attribs[k];
      gl.enableVertexAttribArray(attr.location);
      gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
      gl.vertexAttribPointer(attr.location, attr.size || attr.numComponents, attr.type || gl.FLOAT, attr.normalize || false, attr.stride || 0, attr.offset || 0)
    }
  }

  initTexture() {

    let {gl} = this;
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  }

  renderTexture() {
    // Upload the image into the texture.
    let { gl } = this;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
  }

  clean() {
    this.cleanBuffer();
    this.cleanTexture();
  }
  cleanBuffer() {
    let { gl, attribs } = this;

    for (let k in attribs) {
      let attr = attribs[k];
      gl.deleteBuffer(attr.buffer);
    }
  }
  cleanTexture() {
    let { gl } = this;

    gl.deleteTexture(this.texture);
  }
}
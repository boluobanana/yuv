import { createProgram, resize } from '../../utils';
import { vertex, fragment } from '../shader';
import attributes, {Attributes} from './attributes';
import webglUtils from '../../webgl-utils';
let {
  createProgramInfo
} = webglUtils;

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
  video: HTMLVideoElement;
  attribs: Attributes;
  uniforms: any;

  constructor(opt: YUVOption) {
    this.canvas = opt.canvas;
    this.gl = this.canvas.getContext('webgl');
    this.program = createProgram(this.gl, vertex, fragment);

    this.initVideo(opt);
    this.initAttributes();
    this.initUniform();
  }

  render() {
    let gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);
    this.initTexture();

    this.bindBuffer();
    this.setUniform();

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);

    requestAnimationFrame(this.render.bind(this));

  }

  resize(w?: number, h?: number) {
    resize(this.canvas, window.innerWidth, window.innerHeight);
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

  initVideo(opt: YUVOption) {
    this.video = document.createElement('video');
    this.video.src = opt.src;
    this.video.loop = true;
    this.video.muted = true;
    this.video.autoplay = true;
    this.video.crossOrigin = 'anonymous'
    this.video.play();
    // document.body.appendChild(this.video);
    let w = 320, h = 160;
    this.video.addEventListener('loadedmetadata', e => {
      this.resize(w, h);
    })
    this.video.addEventListener('canplaythrough', e => {
      this.resize(w, h);
    })
  }

  bindBuffer() {
    let {
      gl, attribs
    } = this;

    for (let k in attribs) {
      let attr = attribs[k];
      gl.enableVertexAttribArray(attr.location);
      gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
      gl.vertexAttribPointer(attr.location, attr.size || attr.numComponents, attr.type || gl.FLOAT, attr.normalize || false, attr.stride || 0, attr.offset || 0)
    }
  }

  initTexture() {
    let {gl} = this;
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video);
  }

}
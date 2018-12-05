import { createProgram, resize } from '../../utils';
import { vertex, fragment } from '../shader';
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
  video: HTMLVideoElement;
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
    console.log('123');
    this.initVideo(opt);
    this.initUniform();

  }

  play() {
    console.log('play');
    this.enabled = true;
    this.video.play();
  }

  pause () {
    console.log('pause');
    this.enabled = false;
    this.video.pause();
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

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);
    this.initTexture(this.video);
    this.initAttributes();

    this.bindBuffer(this.attribs);
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
    let attribs= this.attribs = Object.assign({}, attributes);

    for (let k in attribs) {
      let attr = attribs[k];
      attr.location = gl.getAttribLocation(program, k);
      attr.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, attr.bufferSource, gl.STATIC_DRAW)
    }
    return attribs;
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
    // console.log(this.uniforms['u_resolution'].location)
  }
  setUniform() {
    let { gl, uniforms} = this;
    gl.uniform2f(uniforms['u_resolution'].location, gl.canvas.width, gl.canvas.height);
  }

  initVideo(opt: YUVOption) {

    let video =this.video = document.createElement('video');

    video.src = opt.src;
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.crossOrigin = 'anonymous'
    video.play();
    return video;
  }

  bindBuffer(attribs) {
    let {
      gl
    } = this;
    // console.log(attribs);
    for (let k in attribs) {
      let attr = attribs[k];
      gl.enableVertexAttribArray(attr.location);
      gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
      gl.vertexAttribPointer(attr.location, attr.size || attr.numComponents, attr.type || gl.FLOAT, attr.normalize || false, attr.stride || 0, attr.offset || 0)
    }
  }

  initTexture(video) {

    let {gl} = this;
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

  }

}
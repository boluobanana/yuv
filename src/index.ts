import { createProgram, resize } from './utils';
import { vertex, fragment } from './shader';
import attributes, {Attributes} from './attributes';

const uniformKeys = ['u_resolution', 'y_texture', 'u_texture', 'v_texture'];
const textureKeys = ['y_texture', 'u_texture', 'v_texture'];

type Format = {
  width: number,
  height: number,
  chromaWidth: number,
  chromaHeight: number,
  cropTop: number,
  cropLeft: number,
  cropWidth: number,
  cropHeight: number,
  displayHeight: number
  displayWidth: number
}
type ColorData = {
  bytes: Uint8Array,
  stride: number
}
type FrameData = {
  format: Format,
  y: ColorData,
  u: ColorData,
  v: ColorData
}

export interface YUVOption {
  canvas: HTMLCanvasElement
}
type Textures = {
  [name: string]: WebGLTexture
}

export default class YUVRender {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  attributes: any;
  uniformSetters: any;
  attribSetters: any;
  textures: Textures = {};
  attribs: Attributes;
  uniforms: any = {};
  enabled = true;

  constructor(opt: YUVOption) {
    this.canvas = opt.canvas;
    this.gl = this.canvas.getContext('webgl');
    this.program = createProgram(this.gl, vertex, fragment);

    this.resize();
    this.initUniform();
    this.initTexture();
    this.initAttributes();
  }

  static attach(canvas: HTMLCanvasElement) {
    let instance = new YUVRender({
      canvas
    })

    return instance;
  }


  drawFrame(frameData: FrameData) {
    let { gl } = this;
    this.tryResize(frameData);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    this.cleanBuffer();
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);
    this.initAttributes();
    this.renderAttributes();
    this.renderTexture(frameData);
    this.bindBuffer();
    this.setUniform();

    var offset = 0;
    var count = 6;
    gl.drawArrays(gl.TRIANGLES, offset, count);

  }

  render() {

    if (!this.enabled) return;

    let gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    this.cleanBuffer();
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);
    this.initAttributes();

    // this.renderTexture();

    this.renderAttributes();
    this.bindBuffer();
    this.setUniform();

    var offset = 0;
    var count = 6;
    gl.drawArrays(gl.TRIANGLES, offset, count);
  }

  tryResize(frameData: FrameData) {
    let format = frameData.format;
    let { displayWidth, displayHeight } = format;
    let { width, height } = this.canvas;
    if (displayWidth !== width || displayHeight !== height) {
      this.resize(displayWidth, displayHeight);
    }
  }

  resize(w?: number, h?: number) {
    // resize(this.canvas, w || 360, h || 180);
    this.canvas.width = w;
    this.canvas.height = h;
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

    uniformKeys.forEach(name => {
      this.uniforms[name] = {
        location: gl.getUniformLocation(program, name)
      }
    })
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

    let { gl } = this;

    textureKeys.forEach( (name, index) => {
      let texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // Set the parameters so we can render any size image.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      this.textures[name] = texture;
    })
  }

  renderTexture(frameData: FrameData) {
    // Upload the image into the texture.
    let { gl, program } = this;
    textureKeys.forEach((name, i) => {
      let key = name.slice(0, 1);
      let width = frameData[key].stride;
      let height = key === 'y' ? frameData.format.height : frameData.format.chromaHeight;
      let tex = this.textures[name];
      let location = gl.getUniformLocation(program, name);

      gl.uniform1i(location, i);  // texture unit 0
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0, // mip level
        gl.LUMINANCE, // internal format
        width,
        height,
        0, // border
        gl.LUMINANCE, // format
        gl.UNSIGNED_BYTE, //type
        frameData[key].bytes // data!
      );
    })
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

    textureKeys.forEach(name => {
      let tex = this.textures[name];
      gl.deleteTexture(tex);
    })
  }
}
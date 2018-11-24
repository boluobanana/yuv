import { createProgram, resize } from '../utils';
import { vertex, fragment } from './shader';
import webglUtils from '../webgl-utils';

class YUVRender {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;

  constructor(opt) {
    this.canvas = opt.canvas;
    this.gl = this.canvas.getContext('webgl');
    this.program = createProgram(this.gl, vertex, fragment);
    let programInfo = createProgramInfo(this.gl, [vertex, fragment]);

  }

}
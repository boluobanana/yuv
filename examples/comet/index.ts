import { createProgram, resize } from '../utils';
import { vertex, fragment} from './shader';
import {Tail} from './shape/tail';
import { Circle } from './shape/circle';
import Mesh from './shape/mesh';
export interface GLData {
  location: number;
  buffer: WebGLBuffer;
  data: number[];
  size?: number;
  normalize?: boolean;
  stride?: number;
  offset?: number;
  type?: number;
}

class Comet {
  canvas: HTMLCanvasElement;
  textureCanvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  tail: Tail;
  circle: Circle;
  shapes: Mesh[] = [];
  uniforms: any;

  isUniforms = false;
  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl');
    var program = createProgram(gl, vertex, fragment);

    this.gl = gl;
    this.canvas = canvas;
    this.program = program;

    this.uniforms = {
      'u_resolution': {
        location: gl.getUniformLocation(program, "u_resolution")
      }
    }

    const circle = new Circle(gl, program);
    const tail = new Tail(gl, program);

    circle.setSize(tail.headSize);

    this.shapes = [tail, circle];

    canvas.addEventListener('mousemove', e => {
      let x = e.clientX;
      let y = e.clientY;

      this.shapes.forEach(s => {
        s.update(x, y);
      });
    });

  }

  render() {
    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    this.shapes.forEach(s => {
      s.render(() => {
        this.setUniform();
      });
    });

    requestAnimationFrame(this.render.bind(this));
  }

  setUniform() {
    if (this.isUniforms) {
      return;
    }
    this.isUniforms = true;
    console.log('set uniform');
    let { gl, uniforms } = this;
    gl.uniform2f(uniforms['u_resolution'].location, gl.canvas.width, gl.canvas.height);
  }

}

main();

function main() {
  const canvas = document.querySelector('canvas');
  const comet = new Comet(canvas);

  comet.render();
}

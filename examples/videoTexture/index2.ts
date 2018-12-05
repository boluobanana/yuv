import YUVRender from './src/render';

import videos from './120p/*.mp4';


function main() {
    let canvas: HTMLCanvasElement = document.querySelector(`canvas`)

    let renderer = new YUVRender({
      srcs: new Array(15).fill(2).map((_, i) => videos[1+i]),
      canvas
    });

    renderer.render();

  document.querySelector('button').onclick = _ => {
    if (renderer.enabled) {
      renderer.pause();
    } else {
      renderer.play();
    }
  }
}

main();
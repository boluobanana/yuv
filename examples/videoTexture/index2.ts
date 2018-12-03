import YUVRender from './src/render';

import videos from './assets/*.mp4';


function main() {
    let canvas: HTMLCanvasElement = document.querySelector(`canvas`)

    let renderer = new YUVRender({
      srcs: new Array(25).fill(2).map((_, i) => videos[1]),
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
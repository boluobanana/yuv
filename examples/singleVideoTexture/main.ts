import YUVRender from './src/render';

import videos from './assets/*.mp4';


function main() {
    let canvas = document.querySelectorAll(`canvas`)

  canvas.forEach(c => {
    let renderer = new YUVRender({
      src: videos[1],
      canvas: c
    });
    console.log(c);

    renderer.render();

    document.querySelector('button').onclick = _ => {
      if (renderer.enabled) {
        renderer.pause();
      } else {
        renderer.play();
      }
    }
  })

}

main();
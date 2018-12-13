import YUVRender from './src/render';

import videos from './120p/*.mp4';


function main() {
    let canvas = document.querySelectorAll(`canvas`)

  let renders = Array.from(canvas).map((c, i) => {
    let renderer = new YUVRender({
      src: videos[1 + i],
      canvas: c,
      uuid: `uuid${i}`
    });
    renderer.render();
    document.querySelector('button').onclick = _ => {
      if (renderer.enabled) {
        renderer.pause();
      } else {
        renderer.play();
      }
    }
    return renderer;
  })

  if (renders[0].gl === renders[1].gl) {
    console.log('same gl');
  } else {
    console.log('diff gl')
  }

}

main();
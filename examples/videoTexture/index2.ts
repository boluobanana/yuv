import YUVRender from './src/render';

import videos from './assets/*.mp4';

function main() {
    let canvas: HTMLCanvasElement = document.querySelector(`canvas`)

    let renderer = new YUVRender({
      src: videos[1],
      canvas
    });

    renderer.render();

}

main();
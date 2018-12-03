import {Attributes} from './attributes';
export type Elements = Attributes[];

const a_texCoord = {
  bufferSource: Float32Array.from([
    0.0, 0.0,  // 左上
    1.0, 0.0, // 右上
    0.0, 1.0, // 左下
    0.0, 1.0, // 左下
    1.0, 0.0, // 右上
    1.0, 1.0 // 右下
  ]),
  numComponents: 2
}

let origin =  [
    0, 0, // 左上
    640, 0, // 右上
    0, 320, // 左下
    0, 320, // 左下
    640, 0, // 右上
    640, 320 // 右下
  ];
let w = 640, h = 320;
let elements = [];
for(let i = 0; i< 5; i++) {
  for(let j= 0; j<5;j++) {
    elements.push([
      0 + i * w, 0 + j * h, // 左上
      w + i * w, 0 + j * h, // 右上
      0 + i * w, h + j * h, // 左下
      0 + i * w, h + j * h, // 左下
      w + i * w, 0 + j * h, // 右上
      w + i * w, h + j * h // 右下
    ])
  }
}


export default elements.map(el => ({
  a_position: {
    bufferSource: Float32Array.from(el),
    numComponents: 2
  },
  a_texCoord: Object.assign({}, a_texCoord)
}))
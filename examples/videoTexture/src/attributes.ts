export type Attributes = {
  [name: string]: Attribute;
}
export type Attribute = {
  bufferSource: Float32Array;
  numComponents: number;
  buffer?: WebGLRenderbuffer;
  location?: number;
  type?: number;
  size?: number;
  stride?: number;
  offset?: number;
  normalize?: boolean;
}

const attributes: Attributes = {
  a_position: {
    // bufferSource: Float32Array.from([
    //   -1.0, 1.0, // 左上
    //   1.0, 1.0, // 右上
    //   -1.0, -1.0, // 左下
    //   -1.0, -1.0, // 左下
    //   1.0, 1.0, // 右上
    //   1.0, -1.0 // 右下
    // ]),
    bufferSource: Float32Array.from([
      0, 0, // 左上
      640, 0, // 右上
      0, 320, // 左下
      0, 320, // 左下
      640, 0, // 右上
      640, 320 // 右下
    ]),
    numComponents: 2,
  },
  a_texCoord: {
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
} ;

export default attributes;
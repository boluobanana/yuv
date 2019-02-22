export const vertex = `

  attribute vec4 a_position;
  attribute vec2 a_texCoord;

  varying vec2 v_texCoord;
  void main() {

    gl_Position = a_position;
    v_texCoord = a_texCoord;
  }
`;

export const fragment = `
  precision mediump float;

  uniform sampler2D u_image;
  varying vec2 v_texCoord;

  void main() {
    gl_FragColor = texture2D(u_image, v_texCoord);
  }
`;

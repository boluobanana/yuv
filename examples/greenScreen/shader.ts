export const vertex = `

  attribute vec4 a_position;
  attribute vec2 a_texCoord;

  varying vec2 v_texCoord;
  void main() {

    gl_Position = a_position;
    v_texCoord = a_texCoord;
  }
`

export const fragment = `
  precision mediump float;
  // our texture
  uniform sampler2D u_image0;
  uniform sampler2D u_image1;

  // the texCoords passed in from the vertex shader.
  varying vec2 v_texCoord;

  void main() {
    vec4 color0 = texture2D(u_image0, v_texCoord);
    vec4 color1 = texture2D(u_image1, v_texCoord);

    if (color0.g > 0.5 && color0.r < 0.1 && color0.b < 0.1) {
      gl_FragColor = texture2D(u_image1, v_texCoord);
    } else {
      gl_FragColor = texture2D(u_image0, v_texCoord);
    }
  }
`
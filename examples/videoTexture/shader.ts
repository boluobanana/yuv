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
  uniform sampler2D u_image;

  // the texCoords passed in from the vertex shader.
  varying vec2 v_texCoord;

  void main() {
    float y,u,v, r, g, b;
    r = texture2D(u_image, v_texCoord).r;
    g = texture2D(u_image, v_texCoord).g;
    b = texture2D(u_image, v_texCoord).b;
    y = 0.299 * r + 0.587 * g + 0.114 * b;
    u = 0.493 * ( b - y );
    v = 0.877 * ( r - y ) ;

    r = y + 1.5958 * v;
    g = y - 0.39173 * u - 0.81290 * v;
    b = y + 2.017 * u;

    gl_FragColor = vec4(r,g, b, 1.0);
  }
`
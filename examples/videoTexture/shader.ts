export const vertex = `

  attribute vec2 a_position;
  uniform vec2 u_resolution;
  attribute vec2 a_texCoord;

  varying vec2 v_texCoord;
  void main() {

    // convert the rectangle from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;

    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

    // pass the texCoord to the fragment shader
    // The GPU will interpolate this value between points.
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

    // gl_FragColor = texture2D(u_image, v_texCoord);

  }
`
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
  precision lowp float;
  // our texture
  uniform sampler2D y_texture;
  uniform sampler2D u_texture;
  uniform sampler2D v_texture;

  // the texCoords passed in from the vertex shader.
  varying vec2 v_texCoord;

  void main() {
    float fY = texture2D(y_texture, v_texCoord).x;
    float fCb = texture2D(u_texture, v_texCoord).x;
    float fCr = texture2D(v_texture, v_texCoord).x;

    // Premultipy the Y...
    float fYmul = fY * 1.1643828125;

    // And convert that to RGB!
    gl_FragColor = vec4(
      fYmul + 1.59602734375 * fCr - 0.87078515625,
      fYmul - 0.39176171875 * fCb - 0.81296875 * fCr + 0.52959375,
      fYmul + 2.017234375   * fCb - 1.081390625,
      1
    );
  }
`
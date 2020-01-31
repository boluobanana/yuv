export const vertex = `
  attribute vec2 a_comet_position;

  attribute float a_comet_z;

  attribute float a_comet_opacity;

  uniform vec2 u_resolution;

  varying vec2 v_comet_position;
  varying float v_comet_opacity;

  void main() {
    v_comet_opacity = a_comet_opacity;

    // convert the rectangle from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_comet_position / u_resolution;

    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace * vec2(1, -1), a_comet_z, 1.0);

    // pass the texCoord to the fragment shader
    // The GPU will interpolate this value between points.
  }
`

export const fragment = `
  precision mediump float;

  varying float v_comet_opacity;
  // uniform sampler2D u_image;

  void main() {
    gl_FragColor = vec4(1.0, 0 ,0.5, v_comet_opacity);

    // gl_FragColor = texture2D(u_image, v_comet_opacity);
  }
`
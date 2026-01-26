precision highp float;
precision highp int;

uniform sampler2D tDiffuse;
varying vec2 coord;


void main() {
  vec4 color = texture2D(tDiffuse, coord);

  gl_FragColor = vec4(color.x, color.y, color.z, 1.);
}

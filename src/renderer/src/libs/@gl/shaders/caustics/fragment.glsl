
precision highp float;
precision highp int;

#include <utils>

in vec3 oldPos;
in vec3 newPos;
in vec3 ray;

void main() {
  float oldArea = length(dFdx(oldPos)) * length(dFdy(oldPos));
  float newArea = length(dFdx(newPos)) * length(dFdy(newPos));

  gl_FragColor = vec4(oldArea / newArea * 0.2, 1.0, 0.0, 0.0);

  vec3 refractedLight =
    refract(-light, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);

  vec2 t = intersectCube(
    newPos,
    -refractedLight,
    vec3(-1.0, -poolHeight, -1.0),
    vec3(1.0, 2.0, 1.0)
  );

  gl_FragColor.r *=
    1.0 / (1.0 + exp(
      -200.0 / (1.0 + 10.0 * (t.y - t.x)) *
      (newPos.y - refractedLight.y * t.y - 2.0 / 2.0)
    ));
}

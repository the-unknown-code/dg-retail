precision highp float;
precision highp int;

#include <utils>

out vec3 oldPos;
out vec3 newPos;
out vec3 ray;


/* project the ray onto the plane */
vec3 project(vec3 origin, vec3 rayDir, vec3 refractedLight) {
  vec2 tcube = _intersectCube(
    origin,
    rayDir,
    vec3(-1.0, -poolHeight, -1.0),
    vec3(1.0, 2.0, 1.0)
  );

  origin += rayDir * tcube.y;

  float tplane = (-origin.y - 1.0) / refractedLight.y;
  return origin + refractedLight * tplane;
}

void main() {
  vec4 info = texture(water, position.xy * 0.5 + 0.5);
  info.ba *= 0.5;

  vec3 normal = vec3(
    info.b,
    sqrt(1.0 - dot(info.ba, info.ba)),
    info.a
  );

  vec3 refractedLight =
    refract(-light, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);

  ray = refract(-light, normal, IOR_AIR / IOR_WATER);

  oldPos = project(position.xzy, refractedLight, refractedLight);
  newPos = project(position.xzy + vec3(0.0, info.r, 0.0), ray, refractedLight);

  gl_Position = vec4(
    0.75 * (newPos.xz + refractedLight.xz / refractedLight.y),
    0.0,
    1.0
  );
}

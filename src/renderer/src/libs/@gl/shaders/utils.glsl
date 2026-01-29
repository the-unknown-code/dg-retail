const float IOR_AIR = 1.05;
const float IOR_WATER = 1.777;

const vec3 COLOR_83CBEA = vec3(131.0 / 255.0, 203.0 / 255.0, 234.0 / 255.0);
const vec3 COLOR_B2DAEA = vec3(178.0 / 255.0, 218.0 / 255.0, 234.0 / 255.0);
const vec3 CAUSTIC_COLOR = vec3(250.0 / 255.0, 243.0 / 255.0, 233.0 / 255.0);

const vec3 abovewaterColor = COLOR_83CBEA;
const vec3 underwaterColor = COLOR_B2DAEA;

const float poolHeight = .4;

uniform vec3 light;
uniform sampler2D tiles;
uniform sampler2D causticTex;
uniform sampler2D water;


vec2 intersectCube(vec3 origin, vec3 ray, vec3 cubeMin, vec3 cubeMax) {
  vec3 tMin = (cubeMin - origin) / ray;
  vec3 tMax = (cubeMax - origin) / ray;
  vec3 t1 = min(tMin, tMax);
  vec3 t2 = max(tMin, tMax);
  float tNear = max(max(t1.x, t1.y), t1.z);
  float tFar = min(min(t2.x, t2.y), t2.z);
  return vec2(tNear, tFar);
}

vec2 _intersectCube(vec3 origin, vec3 ray, vec3 cubeMin, vec3 cubeMax) {

  // If ray is not going down, never intersect anything
  if (ray.y >= 0.0 || abs(ray.y) < 1e-4) {
    return vec2(1e9, 1e9);
  }

  // Only intersect the floor
  float t = (cubeMin.y - origin.y) / ray.y;

  return vec2(t, t);
}


vec3 getWallColor(vec3 point) {
  float scale = 0.5;

  vec3 wallColor;
  vec3 normal;

  if (abs(point.x) > 0.999) {
    wallColor = texture2D(tiles, point.yz * 0.5 + vec2(1.0, 0.5)).rgb;
    normal = vec3(-point.x, 0.0, 0.0);
  } else if (abs(point.z) > 0.999) {
    wallColor = texture2D(tiles, point.yx * 0.5 + vec2(1.0, 0.5)).rgb;
    normal = vec3(0.0, 0.0, -point.z);
  } else {
    wallColor = texture2D(tiles, point.xz * 0.5 + 0.5).rgb;
    // TODO CAUSTIC LIGHTS
    normal = vec3(0.0, 1.0, 0.0);
  }
  

  scale /= length(point); /* pool ambient occlusion */

  /* caustics */
  vec3 refractedLight = -refract(-light, vec3(.0, .5, 0.0), IOR_AIR / IOR_WATER);
  float diffuse = max(.0, dot(refractedLight, normal));
  vec4 info = texture2D(water, point.xz * 0.5 + 0.5);
  if (point.y < info.r) {
    vec4 caustic = texture2D(causticTex, 0.75 * (point.xz - point.y * refractedLight.xz / refractedLight.y) * 0.5 + 0.5);
    scale += diffuse * caustic.r * 2.0 * caustic.r;
  } else {
    /* shadow for the rim of the pool */
    vec2 t = intersectCube(point, refractedLight, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));
    diffuse *= 1.0 / (1.0 + exp(-200.0 / (1.0 + 10.0 * (t.y - t.x)) * (point.y + refractedLight.y * t.y - 2.0 / 12.0)));

    // scale += diffuse * 0.5;
  }
  
  return wallColor * scale;
}

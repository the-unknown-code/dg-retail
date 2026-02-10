precision highp float;
precision highp int;

#include <utils>

uniform float underwater;
uniform samplerCube sky;

varying vec3 eye;
varying vec3 pos;


vec3 getSurfaceRayColor(vec3 origin, vec3 ray, vec3 waterColor) {
  vec3 color;

  

  if (ray.y < 0.0) {
    vec2 t = intersectCube(origin, ray, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));
    color = getWallColor(origin + ray * t.y);
  } else {
    vec2 t = intersectCube(origin, ray, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));
    vec3 hit = origin + ray * t.y;
    if (hit.y < 7.0 / 12.0) {
      color = getWallColor(hit);
      color += CAUSTIC_COLOR_YELLOW * 10.;

    } else {
      color = textureCube(sky, ray).rgb;
      color += .01 * vec3(pow(max(0.0, dot(light, ray)), 20.0)) * vec3(10.0, 8.0, 6.0);
    }
  }

  if (ray.y < 0.0) color *= waterColor;

  return color;
}


void main() {
  vec2 coord = pos.xz * 0.5 + 0.5;
  vec4 info = texture2D(water, coord);


  /* make water look more "peaked" */
  for (int i = 0; i < 5; i++) {
    coord += info.ba * 0.005;
    info = texture2D(water, coord);
  }

  vec3 normal = vec3(info.b, sqrt(1.0 - dot(info.ba, info.ba)), info.a);
  vec3 incomingRay = normalize(pos - eye);

  // NORMAL
  /*
  gl_FragColor = vec4(normal, 1.0);
  return;
  */
  
  if (underwater == 1.) {
    normal = -normal;
    vec3 reflectedRay = reflect(incomingRay, normal);
    vec3 refractedRay = refract(incomingRay, normal, IOR_WATER / IOR_AIR);
    float fresnel = mix(0.5, 1.0, pow(1.0 - dot(normal, -incomingRay), 3.0));

    vec3 reflectedColor = getSurfaceRayColor(pos, reflectedRay, underwaterColor);
    vec3 refractedColor = getSurfaceRayColor(pos, refractedRay, vec3(1.0)) * vec3(0.8, 1.0, 1.1);

    gl_FragColor = vec4(mix(reflectedColor, refractedColor, (1.0 - fresnel) * length(refractedRay)), 1.0);
  } else {
    vec3 reflectedRay = reflect(incomingRay, normal);
    vec3 refractedRay = refract(incomingRay, normal, IOR_AIR / IOR_WATER);
    float fresnel = mix(0.005, 1.0, pow(1.0 - dot(normal, -incomingRay), 3.));

    // INSERT_YOUR_CODE
    // Map the y-component of the normal from [-1, 1] to [0, 1]
    float n = normal.y * 0.5 + 0.5;
    // Gradient: red at bottom (n=0), blue at top (n=1)
    vec3 gradientColor = mix(vec3(2.0, 2.0, 0.0), vec3(0.0, 0.0, 0.0), n);
    vec3 addedRefractedColor = mix(vec3(2.0, 1.0, 0.0), vec3(0.0, 0.0, 0.0), n);

    // gl_FragColor = vec4(gradientColor, 1.0);
    // return;


    vec3 reflectedColor = getSurfaceRayColor(pos, reflectedRay, underwaterColor);
    vec3 reflectedColor2 = getSurfaceRayColor(pos, -reflectedRay, underwaterColor) + gradientColor;

    vec3 refractedColor = getSurfaceRayColor(pos, refractedRay, abovewaterColor);
    vec3 refractedColor2 = getSurfaceRayColor(pos, refractedRay, abovewaterColor) + addedRefractedColor;

    gl_FragColor = vec4(mix(refractedColor2, mix(reflectedColor, reflectedColor2, fresnel), fresnel), 1.0);
  }
}

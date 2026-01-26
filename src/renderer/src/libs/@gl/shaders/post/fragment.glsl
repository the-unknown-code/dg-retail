uniform sampler2D inputBuffer;

varying vec2 vUv;

void main() {
    gl_FragColor = vec4(texture2D(inputBuffer, vUv).rgb, 1.0);
}
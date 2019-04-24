#version 110
const float ar = 1.8; //Aspect ratio
uniform float iTime;
varying vec2 uv;
void main()
{
    gl_FragColor = vec4(uv.x / ar, mod(iTime, 1.), 0., 1.0);
}
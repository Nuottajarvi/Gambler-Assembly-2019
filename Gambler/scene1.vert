#version 110
uniform mat4 MVP;
attribute vec3 vCol;
attribute vec2 vPos;
attribute vec2 vTex;
varying vec2 uv;
void main()
{
    gl_Position = MVP * vec4(vPos, 0.0, 1.0);
    uv = vTex;
}
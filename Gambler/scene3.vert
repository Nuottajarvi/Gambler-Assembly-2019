#version 110
uniform mat4 MVP;
attribute vec3 vCol;
attribute vec3 vPos;
attribute vec2 vTex;
varying vec2 uv;
void main()
{
    gl_Position = vec4(vPos, 1.0);
    uv = vTex;
}
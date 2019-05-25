#version 110
uniform mat4 MVP;
attribute vec3 vCol;
attribute vec3 vPos;
attribute vec2 vTex;
attribute vec3 vWorldPos;
attribute vec3 vNor;
uniform float iTime;
varying vec2 uv;
varying vec3 n;
varying mat3 iRot;
varying vec3 pos;

mat3 rotationMatrixY(float rad) {
    return mat3(
        vec3(cos(rad), 0.0, sin(rad)),
        vec3(0.0, 1.0, 0.0),
        vec3(-sin(rad), 0.0, cos(rad))
    );
}

mat3 rotationMatrixX(float rad) {
    return mat3(
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, cos(rad), -sin(rad)),
        vec3(0.0, sin(rad), cos(rad))
    ); 
}

mat3 rotationMatrixZ(float rad) {
    return mat3(
        vec3(cos(rad), -sin(rad), 0.0),
        vec3(sin(rad), cos(rad), 0.0),
        vec3(0.0, 0.0, 1.0)
    );
}

float random(vec3 co){
    return fract(sin(dot(co.xyz ,vec3(12.9898, 78.233, 34.13451))) * 43758.5453);
}

void main()
{
	float t = iTime + 5.;
	iRot = 
		rotationMatrixX(-2.5) *
		rotationMatrixY(1.5) *
		rotationMatrixZ(0.);
	vec3 locObj = iRot * vPos;
	gl_Position = MVP * vec4(locObj - vec3(-t * 0.1, 0., 3.), 1.0);
	uv = vTex;
	n = vNor;
	pos = vPos;
}
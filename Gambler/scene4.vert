#version 110
uniform mat4 MVP;
attribute vec3 vPos;
attribute vec2 vTex;
varying vec2 uv;

uniform float iTime;

const float PI = 3.14159;

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

void main()
{

	float slerp = smoothstep(0., 1., iTime * 0.2);
	float zRot = mix(PI / 1.5, 0., slerp);
	float xRot = mix(PI / 2., 0., slerp);

    gl_Position = MVP * vec4(rotationMatrixZ(zRot) * rotationMatrixX(xRot) * vPos + vec3(0., 0., -8.), 1.0);
    uv = vTex;
}
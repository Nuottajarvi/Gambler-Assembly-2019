#version 110
uniform mat4 MVP;
attribute vec3 vPos;
attribute vec2 vTex;
attribute vec3 vWorldPos;
varying float isBg;
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
	if(vWorldPos == vec3(0.)) {
		isBg = 1.;
		uv = vTex;
		gl_Position = MVP * vec4(vPos, 1.);
	} else {
		float zRot, xRot = 0.;
		float z = -8.;
		float y = 0.;
		float x = 0.;

		float time = 1. + iTime;

		if(time < 18.) {
			z += 9. - time * .5;
			zRot = PI / 1.5;
			xRot = PI / 2.;
		} else if(time < 23.5) {
			float t = time - 18.;
			float slerp = smoothstep(0., 1., t * 0.2);
			zRot = mix(PI / 1.5, 0., slerp);
			xRot = mix(PI / 2., 0., slerp);
		} else {
			float t = time - 23.5;
			float t2 = time - 24.5;
			//zRot = mix(0., PI / 4., min(1., t * 5.));
			//y = max(-2., -t * 10.);
			xRot = 0.;
			zRot = 0.;
			x = min(0., -t * 32.);
		}

		gl_Position = MVP * vec4(rotationMatrixZ(zRot) * rotationMatrixX(xRot) * vPos + vec3(x, y, z), 1.0);
		uv = vTex;
	}
}
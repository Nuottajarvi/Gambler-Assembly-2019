#version 110
uniform mat4 MVP;
attribute vec3 vCol;
attribute vec3 vPos;
attribute vec2 vTex;
attribute vec3 vWorldPos;
uniform float iTime;
varying vec2 uv;
varying float z;
varying mat3 iRot;
varying float face;
varying float isBg;

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
	//is background
	if(vWorldPos == vec3(0., 0., 0.)) {
		gl_Position = MVP * vec4(vPos, 1.0);
		isBg = 1.;
	} else {
		iRot = rotationMatrixY(random(vWorldPos.xyz)) *
			rotationMatrixX(t * (random(vWorldPos.yxz) + 0.2)) *
			rotationMatrixZ(t * random(vWorldPos.zyx));
		vec3 locObj = iRot * vPos;
		vec3 zDrive = vec3(0., 0., iTime * iTime * .33);
		gl_Position = MVP * vec4(locObj + vWorldPos + zDrive, 1.0);
		z = vWorldPos.z + zDrive.z;
		face = vPos.z;
		isBg = 0.;
	}
	uv = vTex;
}
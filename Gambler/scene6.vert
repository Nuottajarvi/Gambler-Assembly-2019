#version 330
uniform mat4 MVP;
uniform float iTime;
out vec2 uv;
in vec3 vPos;
in vec3 vWorldPos;
in vec2 vTex;
in vec3 vNor;

out float isBg;
out float isBack;
out vec3 n;
out mat3 rot;

const float PI = 3.141592;
const float EPSILON = 0.0001;

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

vec3 bounce(float str, float t) {

	float bounceAmt = floor(t / PI);

	float extraBounce = max(0., 3. - ((t - PI / 2.) * 2.));

	return vec3(
		min(str, max(0., t / str)) * .2,
		-abs(sin(t)) * max(0., str - bounceAmt) - extraBounce,
		min(str, max(0., t / str)) * .5
	);
}

void main()
{
	float t = iTime + PI / 2.;
	float str = 3.;
	float z = log(1. / min(iTime + 0.5, 8.4));
	float rotSpeed = -z * 2. + 3.6;
	rot = rotationMatrixX(rotSpeed) * rotationMatrixZ(.4 * rotSpeed);
	vec3 npos = vPos;
	if(vWorldPos.x > 0) {
		npos = rot * npos + vec3(0., 0., -8) + bounce(str, t) + vec3(vWorldPos.y * 3., 0., 0.);
	}

	gl_Position = MVP * vec4(npos, 1.0);
	uv = vTex;
	if(vWorldPos.x == 0.) {
		isBg = 1.;
	} else if(vWorldPos.x == 2){
		isBack = 1.;
	}

	n = vNor;
}
#version 330
uniform mat4 MVP;
uniform float iTime;
out vec2 uv;
in vec3 vPos;
in vec3 vWorldPos;
in vec2 vTex;
in vec3 vNor;

out float isFg;
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

vec3 bounce(float str, float t, float id) {

	t -= id * .5;
	
	float bounceAmt = floor(t / PI);

	float extraBounce = max(0., 3. - ((t - PI / 2.) * 2.));

	float dirx = -0.5;
	float dirz = 0.1;

	if(abs(id) < EPSILON) {
		dirx = -0.25;
		dirz = 0.3;
	} else if(abs(id - 2.) < EPSILON) {
		dirx = 0.;
		dirz = 1.;
	}

	return vec3(
		min(8.4 + id*.5, t) * dirx / str,
		-abs(sin(t)) * max(0., str - bounceAmt) - extraBounce,
		min(8.4 + id*.5, t) * dirz / str
	);
}


void main()
{
    float id = vWorldPos.y;
	float nid = 
		abs(id - 2.) < EPSILON ? 1. : 
		abs(id - 1.) < EPSILON ? 2. : 
		0;
	float t = iTime + PI / 2.;
	float str = 3.;
	float z = log(1. / min((iTime + 0.5 - 0.5 * nid), 8.4));
	float rotSpeed = -z * 2. + 3.6;

	float xspeed = nid == 0. ? 1. : nid == 1. ? 2.6 : 0.82;
	float zspeed = nid == 1. ? 1.3 : 1.;

	rot = rotationMatrixX(rotSpeed * xspeed) * rotationMatrixZ(.4 * rotSpeed * zspeed);
	vec3 npos = vPos;
	if(vWorldPos.x > EPSILON) {
		npos = rot * npos + vec3(0., 0., -8) + bounce(str, t, nid) + vec3(3 - id * 3., 0., 0.);
	};

	uv = vTex;
	isFg = 0.;
	isBack = 0.;
	if(vWorldPos.x < EPSILON) {
		isFg = 1.;
		gl_Position = vec4(vPos, 1.0);
	} else {
		gl_Position = MVP * vec4(npos, 1.0);
	}
	
	if(vWorldPos.x >= 2 - EPSILON){
		isBack = 1.;
	}

	n = vNor;
}
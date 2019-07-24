#version 330
uniform float iTime;
in vec2 uv;
uniform sampler2D diceTex;

const float EPSILON = 0.01;
const float PI = 3.14159;

out vec4 fragColor;

in float isFg;
in float isBack;
in vec3 n;
in mat3 rot;

void main() {
	vec3 light = vec3(2., 8., 0.);

	float flip = isBack > 0. ? -1. : 1.;
	float lightAmt = max(0., dot(light, rot * n * flip)) * .1 + .3; 
	vec3 col = texture(diceTex, uv).rgb;

	float a = 0.7;

	if(col.b >= 1. - EPSILON) {
		a = .9;
	}

	float fadeoutTime = 10.;
	float c = fadeoutTime - max(fadeoutTime, iTime);

	a += c;
	
	vec3 lightedCol = col * lightAmt;
	
	fragColor = vec4(lightedCol, a);
}
#version 330
uniform float iTime;
in vec2 uv;
uniform sampler2D diceTex;

const float EPSILON = 0.01;
const float PI = 3.14159;

out vec4 fragColor;

in float isBg;
in float isBack;
in vec3 n;
in mat3 rot;


void main() {
	vec3 light = vec3(2., 8., 0.);
	if(isBg >= 1. - EPSILON) {
		fragColor = vec4(0.);
	} else {
	
		float flip = isBack > 0. ? -1. : 1.;
		float light = max(0., dot(light, rot * n * flip)) * .1 + .3; 
		vec3 col = texture(diceTex, uv).rgb;
		vec3 lightedCol = col * light;

		float a = 0.4;

		if(col.b >= 1. - EPSILON) {
			a = .9;
		}
	
		fragColor = vec4(lightedCol, a);
	}
}
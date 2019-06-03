#version 330 core
uniform sampler2D fbo_tex;
in vec2 uv;
uniform float iTime;

out vec4 gl_FragColor;

uniform float weight[5] = float[] (0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);
const float offset = 0.002;

vec4 blur(vec4 col, int amt) {
	
	return col;
}


void main(void) {

	//blur
	vec3 col = texture2D(fbo_tex, uv).rgb * weight[0];
	for(int i = 1; i < 5; i++) {
		col += texture2D(fbo_tex, uv + vec2( i*offset, 0.)).rgb * weight[i];
		col += texture2D(fbo_tex, uv + vec2(-i*offset, 0.)).rgb * weight[i];
		col += texture2D(fbo_tex, uv + vec2(0.,  i*offset)).rgb * weight[i];
		col += texture2D(fbo_tex, uv + vec2(0., -i*offset)).rgb * weight[i];
	}

	gl_FragColor = vec4(col, 1.);
}
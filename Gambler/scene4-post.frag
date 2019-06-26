#version 330 core
uniform sampler2D fbo_tex;
in vec2 uv;
uniform float iTime;
uniform int iPass;

out vec4 gl_FragColor;

uniform float weights[5] = float[] (0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);
float offset = 0.002;
vec3 aa() {

	float offset = 0.0005;
	vec3 col = texture2D(fbo_tex, uv).rgb;
	for(int i = 1; i < 3; i++) {
	
		if(iPass % 2 == 0) {
			col += texture2D(fbo_tex, uv + vec2( i*offset, 0.)).rgb;
			col += texture2D(fbo_tex, uv + vec2(-i*offset, 0.)).rgb;
		} else {
			col += texture2D(fbo_tex, uv + vec2(0.,  i*offset)).rgb;
			col += texture2D(fbo_tex, uv + vec2(0., -i*offset)).rgb;
		}
	}

	col /= 5;

	return col;
}

void main(void) {

	offset * (iPass + 1);

	//blur
	vec3 col = texture2D(fbo_tex, uv).rgb * weights[0];
	for(int i = 1; i < 5; i++) {
	
		float weight = weights[min(4, i)];
		if(iPass % 2 == 0) {
			col += texture2D(fbo_tex, uv + vec2( i*offset, 0.)).rgb * weight;
			col += texture2D(fbo_tex, uv + vec2(-i*offset, 0.)).rgb * weight;
		} else {
			col += texture2D(fbo_tex, uv + vec2(0.,  i*offset)).rgb * weight;
			col += texture2D(fbo_tex, uv + vec2(0., -i*offset)).rgb * weight;
		}
	}

	col *= 1.1;

	if(iTime > 22.) {
		col = mix(col, aa(), (iTime - 22.)*.33);
	}

	gl_FragColor = vec4(col, 1.);
}
#version 330 core
uniform sampler2D fbo_tex;
in vec2 uv;

out vec4 gl_FragColor;

void main(void) {
	vec4 col = texture2D(fbo_tex, uv);
	gl_FragColor = col + vec4(uv, 0., 1.) * .5;
}
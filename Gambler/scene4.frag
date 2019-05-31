#version 330
uniform float iTime;
in vec2 uv;

layout(location = 0) out vec4 color;

//out vec4 gl_FragColor;

void main() {

	//gl_FragColor = vec4(1., 1., 0., 1.);
    color = vec4(1., 1., 0., 1.);
	//color = vec4(uv, 0., 1.);
}
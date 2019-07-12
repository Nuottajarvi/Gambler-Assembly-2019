#version 330 core
uniform sampler2D fbo_tex;
in vec2 uv;
uniform float iTime;
uniform int iPass;

out vec4 gl_FragColor;

float offset = 0.0005;
const float EPSILON = 0.001;


const vec3 gold = vec3(158. / 255., 122. / 255., 14. / 255.);

mat2 rot(float r) {
	return mat2(
		vec2(cos(r), sin(r)),
		vec2(-sin(r), cos(r))
	);
}

bool crown(vec2 uv) {
	bool flag = false;
	for(float i = 0; i < 3; i+=1.){
		vec2 nuv = uv + vec2(0., 0.04);
		nuv = rot(-.8 + .8 * i) * nuv;
		float y = nuv.y * .35 - 0.04;
		if(y + abs(nuv.x) < 0. && y > -0.04) {
			flag = true;
		}
	}

	//small hole in the bottom
	if(uv.y > -0.07 && uv.y < -0.02 && abs(uv.x) < 0.025) {
		flag = true;
	}

	return flag;
}

vec2 hash( vec2 x ) {
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return -1.0 + 2.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}

vec4 coin(vec2 uv, float i, float j) {
	uv.x *= 1.8;
	bool isIn = uv.x * uv.x + uv.y * uv.y < 0.03;

	if(isIn) {
		float light = .8 + uv.y * 2.;

		if(abs(uv.x * uv.x + uv.y * uv.y - 0.02) < 0.005) {
			light -= 0.2;
		}

		vec2 h = hash(vec2(i, j)) * 5.;
		if(abs(h.y) < 0.2) {
			h.y = 0.5;
		}
		if(crown(rot(h.x + iTime * h.y) * uv)) {
			light -= 0.2;
		}

		return vec4(gold * light, 1.);
	}
	return vec4(0.);
}

vec4 coinFlush(vec2 uv) {
	uv.y -= 3.;
	uv.y += (iTime - 5.) * .25;
	vec4 col = vec4(0.);
	for(int i = 0; i < 10; i++) {
		for(int j = 0; j < 10; j++) {
			if(col.a < EPSILON) {
				col = coin(uv - vec2(i * .2 + mod(j, 2) * .1, j * .3), i, j);
			}
		}
	}
	return col;
}

void main(void) {
	//blur
	
	vec4 col = texture2D(fbo_tex, uv);
	for(int i = 1; i < 3; i++) {
	
		if(iPass % 2 == 0) {
			col += texture2D(fbo_tex, uv + vec2( i*offset, 0.));
			col += texture2D(fbo_tex, uv + vec2(-i*offset, 0.));
		} else {
			col += texture2D(fbo_tex, uv + vec2(0.,  i*offset));
			col += texture2D(fbo_tex, uv + vec2(0., -i*offset));
		}
	}

	col /= 5;

	col.a = mix(1., 0., max(0., (iTime - 16.) * 0.25));

	if(iTime > 1.) {
		vec4 cf = coinFlush(uv);
		if(cf.a > EPSILON) {
			col = cf;
		}
	}
	
	gl_FragColor = col;
}
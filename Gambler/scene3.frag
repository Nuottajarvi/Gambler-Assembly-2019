#pragma once

varying vec3 n;
varying vec2 uv;
varying vec3 pos;

uniform sampler2D sofaTex;
uniform sampler2D roomTex;

bool isCol(vec3 col) {
	return col.x > 0.9 && col.y < 0.1 && col.z < 0.1;
}

vec2 hash( vec2 x ) {
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return -1.0 + 2.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}

//a = angle
vec2 rotate2D(vec2 v, float a) {
    return vec2(
        v.x * cos(a) - v.y * sin(a),
        v.y * cos(a) + v.x * sin(a)
    );
}

float noise( in vec2 p ) {
    vec2 i = floor( p );
    vec2 f = fract( p );
	
	vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( hash( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                     dot( hash( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( hash( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                     dot( hash( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}


vec4 wood(vec2 uv) {
    
	uv *= 2.; 

	float m = 1.1;
	float n0 = 8.2;
    float n1 = 2.2;
    float n2 = 3.1;
    
	//noise generation
    float ns = noise(vec2(uv * n0)); uv = m * uv;
    ns += noise(vec2(uv * n1)); uv = m * uv;
    ns += noise(vec2(uv * n2)); uv = m * uv;

	//lines
	vec2 uvr = rotate2D(uv + vec2(4.13), ns * 0.02);
   
    float f = sin(uvr.x * 100.) * .8;

    vec3 basecol = vec3(184., 121., 80.) / 255.;
    vec3 col = basecol + vec3(f) * .1;

	return vec4(col, 1.);
}

void main() {
	vec3 lightPos = vec3(0.2, -1., 0.);
	float diff = dot(n, lightPos);
	float light = (diff + 0.2 + pos.y) * .5;
	vec4 texCol = texture(roomTex, uv);
	vec4 col = texCol;
	if(isCol(col.rgb)) {
		if(abs(n.y) > 0.5)
			col = wood(pos.xz * .5);
		else if(abs(n.x) > 0.5) {
			col = wood(pos.zy * .5);
		} else {
			col = wood(pos.xy * .5);
		}
	}
	if(isCol(col.grb)) {
		col = texture(sofaTex, uv * 70.);
	}
	if(isCol(col.brg)) {
		//floor
		col = vec4(vec3(noise(pos.xz * 70.) * .3 + vec3(.2, .2, .3)), 1.);
	}
	gl_FragColor = vec4(vec3(light), 1.) * col;
}
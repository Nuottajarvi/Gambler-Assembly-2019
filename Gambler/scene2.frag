#version 110
uniform float iTime;
varying vec2 uv;
varying float z;
varying mat3 iRot;
varying float isBg;

const float EPSILON = 0.01;
const float PI = 3.14159;

const float ar = 1.8;

const vec3 white = vec3(0.8);
const vec3 red = vec3(142./255., 19./255., 12./255.);

varying float face;

struct chipM {
	vec4 h;
    vec2 w;
    vec2 r;
};

vec2 hash( vec2 x ) {
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return -1.0 + 2.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}

float noise( vec2 p ) {
    vec2 i = floor( p );
    vec2 f = fract( p );
	
	vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( hash( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                     dot( hash( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( hash( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                     dot( hash( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

float fbm(vec2 p) {
	
	float a = 0.;
	vec2 os = vec2(0.);
	float mul = 1.3;

	for(float i = 0.; i < 5.; i+=1.) {
		float ang = 0.5 * i;
		mat2 rot = mat2(cos(ang), sin(ang),
                    -sin(ang), cos(ang));
		a += noise(rot * ((p + os) * mul));
		mul*=2.;
		os += vec2(4., 10.);
	}

	return a;
}

vec3 chip(vec3 chipCol, vec2 uv) {

	chipM chipM = chipM(vec4(0.25, 0.19, 0.17, 0.16) * 4., vec2(1.), vec2(.5));
    vec2 v = uv;
    float lv = length(v);

	vec3 col = vec3(1.);
    
    //total width
    if (lv < chipM.h.x) {
        //center
        if(lv < chipM.h.w) {
        	return chipCol;
        //12 white ones 
        }else if(lv > chipM.h.w && lv < chipM.h.z) {
        	if(mod(atan(v.y / v.x) + PI / 8. + chipM.r.y, PI / 6.) < PI / 12. * chipM.w.y) {
        		return white;   
            } else {
                return chipCol;   
            }
        //between layer
        }else if(lv < chipM.h.y) {
        	return chipCol;
        //outer layer
        } else if(mod(atan(v.y / v.x) + chipM.r.x, PI / 3.) < PI / 6. * chipM.w.x) {
        	return white;
        } else {
        	return chipCol;   
        }
    }
    return col;
	    
}

void main() {

	if(isBg > 0.5) {
		float osx = fbm(uv + iTime * .025) + iTime * .025;
		float osy = fbm(uv + iTime * .01) + iTime * .025;
	
		float bgFloat = fbm(uv * .25 + vec2(osx, osy));
		bgFloat += 1.;
		bgFloat *= .5;

		vec3 bgCol = mix(vec3(0.1, 0.3, 0.1), vec3(0.3, 0.5, 0.05), bgFloat);
		bgCol = mix(bgCol, vec3(.7, .7, 0.), osx);
		gl_FragColor = vec4(bgCol, 1.);
	} else {
		vec3 col = chip(red, uv);
		vec3 normal;
		if (length(uv) + EPSILON > 1. ) {
			normal = vec3(uv.x, uv.y, 0.);
		} else {
			normal = vec3(0., 0., 1. * sign(face));
		}
		normal = iRot * normal;
		vec3 lightDir = vec3(0., 1., 0.);
		float diff = max(dot(normal, lightDir), 0.0);
		float light = diff * .5 + .5;
		vec3 lightCol = col * light;
		gl_FragColor = vec4(lightCol, 1. - z * z * .0033);
	}
}
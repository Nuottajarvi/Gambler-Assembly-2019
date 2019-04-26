#version 110
uniform float iTime;
varying vec2 uv;
const float PI = 3.14159;

const float ar = 1.8;

const vec3 white = vec3(0.8);
const vec3 red = vec3(142./255., 19./255., 12./255.);

struct chipM {
	vec4 h;
    vec2 w;
    vec2 r;
};

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
	vec3 col = chip(red, uv);
    gl_FragColor = vec4(col, 1.);
}
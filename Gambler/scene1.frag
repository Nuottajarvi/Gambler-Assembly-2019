#version 110
uniform float iTime;
varying vec2 uv;

const float ar = 1.8;
const float EPSILON = 0.000001;
const float start = 0.01;
const float end = 100.0;
const float PI = 3.14159;

const vec3 white = vec3(0.8);
const vec3 red = vec3(142./255., 19./255., 12./255.);
const vec3 green = vec3(0., 150./255., 91./255.) * .8;

struct chipM {
	vec4 h; //radius: outer white, red in between, white stripe
    vec2 w; //width: outer, inner
    vec2 r; //rotation: outer, inner
};

vec3 chip(vec3 col, vec3 chipCol, vec2 uv, vec2 pos, chipM chipM) {
    vec2 v = uv - pos;
    float lv = length(v);
    
    //total width
    if(lv < chipM.h.x) {
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

float smoothedSquareWave(float t, float pw) {
    float c = 0.85;
    
	return (1./c) * atan((c*sin(t)) / (1. - c*cos(t))) +
        (1./c) * atan((c*sin(PI*pw - t)) / (1. - c*cos(PI*pw - t)));
}

float tiltedSin(float t) {
	float c = 0.85;

	return (1./c) * atan((c*sin(t)) / (1. - c*cos(t)));
}

void main() {
    // Normalized pixel coordinates (from 0 to 1)
	
    float phase1 = 1.;
    float phase2 = 28.159;//27.64;
    float phase3 = 40.;

    float t = iTime;
    
    vec3 col = vec3(0.15);
    
    vec4 h = vec4(0.25, 0.19, 0.17, 0.16);
    vec2 w = vec2(1., 1.);
    vec2 r = vec2(0., 0.);
    
    vec2 p0 = vec2(.18 * ar, 0.5);
    vec2 p1 = vec2(.5 * ar, 0.5);
	vec2 p2 = vec2(.82 * ar, 0.5);
    
    vec4 h0 = vec4(1.);
    vec4 h1 = vec4(1.);
    vec4 h2 = vec4(1.);
    
    vec2 w0 = vec2(1.);
    vec2 w1 = vec2(1.);
    vec2 w2 = vec2(1.);
    
    vec2 r0 = vec2(1.);
    vec2 r1 = vec2(1.);
    vec2 r2 = vec2(1.);
    
    vec2 pg0 = vec2(.34*ar, 0.5);
    vec2 pg1 = vec2(.67*ar, 0.5);
    vec4 hg = vec4(0.0);
    vec2 wg = vec2(1.);
    vec2 rg = vec2(0.);

	
	const float mros = 10.5;
    
    //PHASE 1
    if(t < phase1) {
    	h *= smoothstep(0., 1., (t * t) / phase1);
        r += t;
    }
    //PHASE 2
    else if(t < phase2) {
        
        float beatPower = min(.6, .3 / (t / phase2)) - .3;
		//some extra power in middle
		float beat8 = 20.106;
		if(t > beat8) {
			beatPower += sin(((t - beat8) * PI) / (phase2 - beat8)) * .1;
		}
        float d0 = tiltedSin((t-phase1) * 5.) * beatPower;
        float d1 = tiltedSin(((t-phase1) + PI) * 5.) * beatPower;

        h0 = vec4(d0 + 1.);
        h1 = vec4(d1 + 1.);
        h2 = h0;
            
        r = vec2(t);
        
        //middle fast spin
        float a = 10.35;
        if(t > a && t < a + 7.5) {
            float nt = t - a;
            float speed = -7.5 + nt * .5;
        	r1 = vec2(speed * nt);
        } else if(t > 5.35) {
       		r1 = vec2(5. * (t - 5.35) + 5.35);
            if(t > a + 7.5) {
            	r1 = vec2(7.5 * (-7.5 + 7.5 * .5));
                //middle rot speed
                if(t > a + mros) {
                    float mrs = min(t - (a + mros), .5);
                	r.y += mrs*-4.*(t - (a + mros));
                }
            }
        }
        
        //edge widths
        if(t > 12.) {
            float mt = mod(t + 1., 2.);
            float val = -1.*(mt-1.)*(mt-1.) + 1.; 
        	w0.x = val;
            w2.x = w0.x;
            
            r0.x = .2*val - .25;
            r2.x = r0.x;
        }
    }
    //PHASE 3
   if(t > phase2 && t < 30000.) {        
        if(t < phase2 + 2.) {
            r = vec2(t);
            float xt = t - phase2;
            float mt = mod(t + 1., 2.);
			if(t > 29.) {
				mt = 0.;
			}
            float val = -1.*(mt-1.)*(mt-1.) + 1. - xt * 0.2; 
        	w0.x = val;
            w2.x = w0.x;
            
            //middle rot
            float a = 10.35;
            float mrs = min(t - (a + mros), .5);
            r.y += mrs*-4.*(t - (a + mros));
            
            r0.x = .2*val - .25;
            r1 = vec2(7.5 * (-7.5 + 7.5 * .5));
            r2.x = r0.x;
            
			//before jump part the width goes to zero
            w0.y = 1. - xt * .5;
            w2.y = w0.y;
            w1 = vec2(1. - xt * .5);
        }else if(t < phase2 + 3.) {
			//first time falling
            w = vec2(0.);
            float xt = t - (phase2 + 2.);
            vec2 mov1 = vec2(0., tiltedSin(xt + PI) * 0.2);
            p0 += mov1;
            p1 += mov1;
            p2 += mov1;
            
            h0 = vec4(mov1.y + .5) * 2.;
            h2 = h1 = h0;
            
        } else {
        	float xt = t - (phase2 + 3.);
            vec2 mov0 = vec2(0., tiltedSin(xt * 5.)) * 0.2 * max(1., t - 39.159);
            vec2 mov1 = vec2(0., tiltedSin((xt + PI) * 5.)) * 0.2 * max(1., t - 39.659);

			if(t > 41.159) {
				mov0 = vec2(-5.);
			}
			if(t > 41.659) {
				mov1 = vec2(-5.);
			}

            p0 += mov1;
            p1 += mov1;
            p2 += mov1;

            h0 = vec4(mov1.y + .4) * 2.;
            h2 = h1 = h0;
            
            r = vec2(sin((xt + 2.) * 5.) * .5);
            
            //after first lowering
            if(t > phase2 + 3.45) {
                w0 = vec2(smoothedSquareWave((xt + PI) * 5., 1.5)) * 1.2;
                w2 = w1 = w0;
            } else {
            	w2 = w1 = w0 = vec2(0.);   
            }
           
            pg0 += mov0;
            pg1 += mov0;
            hg = vec4(mov0.y + .4) * 2.;
            wg = vec2(smoothedSquareWave(xt * 5., 1.5)) * 1.2;
            
        }
    }
    
	if(h0.x > hg.x) {
		col = chip(col, green, uv, pg0, chipM(h*hg, w*wg, r+rg));
		col = chip(col, green, uv, pg1, chipM(h*hg, w*wg, r+rg));
	}
    col = chip(col, red, uv, p0, chipM(h*h0, w*w0, r+r0));
    col = chip(col, red, uv, p1, chipM(h*h1, w*w1, r+r1));
    col = chip(col, red, uv, p2, chipM(h*h2, w*w2, r+r2));
    
	if(h0.x <= hg.x) {
		col = chip(col, green, uv, pg0, chipM(h*hg, w*wg, r+rg));
		col = chip(col, green, uv, pg1, chipM(h*hg, w*wg, r+rg));
	}

    // Output to screen
    gl_FragColor = vec4(col,1.0);
}
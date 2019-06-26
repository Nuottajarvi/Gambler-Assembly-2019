#version 110
uniform float iTime;
varying vec2 uv;

const float PI = 3.142;
const float e = 2.718;

float random(vec2 v){
    return fract(sin(dot(v.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec2 lerp(vec2 a, vec2 b, vec2 c) {
	float x = b.x - a.x;
    float y = b.y - a.y;   
    
	return vec2(
        a.x + x * (c.x / 50. - a.x),
        a.y + y * (c.y / 50. - a.y)
    );
}

//a = angle
vec2 rotate2D(vec2 v, float a) {
    return vec2(
        v.x * cos(a) - v.y * sin(a),
        v.y * cos(a) + v.x * sin(a)
    );
}

vec2 hash( vec2 x ) {
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return -1.0 + 2.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
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

bool roundedSquare(vec2 pos, vec2 b, float r) {
    return length(max(abs(pos)-b,0.0))-r < 1.0;
}

bool rect(vec2 pos, vec2 size) {
	return abs(pos.x) < size.x && abs(pos.y) < size.y;   
}

bool charA(vec2 pos) {
    pos *= 22.;
    pos.x = abs(pos.x);
    if(rect(pos - vec2(0.4, 0.), vec2(0.25, 0.1))) {
    	return true;   
    }
    
    if(rect(pos - vec2(0.15, 0.4), vec2(0.2, 0.1))) {
    	return true;   
    }
    
    vec2 t = rotate2D(pos, -0.3);
    
    if(rect(t - vec2(0.4, 0.75), vec2(0.1, 0.8))) {
    	return true;   
    }
       
    return false;
}

float st = 13.;//turning start time
bool diamond(vec2 pos, vec2 d, float s) {

    float x = abs(pos.x * d.x);
    float y = abs(pos.y * d.y);
	float dia = x + y + s * 1.5 * min(x,y) - s;

	float cx = abs(pos.x) * d.x - 0.04 / d.x;
    float cy = pos.y * d.x;

	float hx = pos.x * d.x;
	float hy = cy + .064 / d.x;

	float lx = abs(hx) / smoothstep(
		0., 1.,
		min(1., max(0., iTime - st - 1.))
	);

	float ly = cy * .3;

	float club = 
		min(
			(cx * cx + cy * cy) * 50. - .1 / d.x,
			min(
				(hx * hx + hy * hy) * 50. - .1 / d.x,
				ly < .017 ? 10. * (lx - ly) : 999999.
			)
		);

	return mix(dia, club, min(1., max(0., (iTime - st) * .4))) < 0.;
}

vec3 card(vec2 uv, vec3 col) {
    vec2 pos = uv - vec2(0.9, 0.5);
    bool sq = roundedSquare(pos * 20., vec2(2.5, 4.5), 0.1);
    bool shadow = roundedSquare((pos + vec2(-0.01, -0.01)) * 20., vec2(2.5, 4.5), 0.1);
    
    vec3 red = vec3(0.8196, 0.1765, 0.2118);
    vec3 black = vec3(0.);

	
	float m = max(0., iTime - st);
    
    if(charA(uv - vec2(0.77, 0.68))) {
    	return mix(red, black, m);
    }
    
    vec2 flippeduv = uv * -1.;

    
    if(charA(flippeduv + vec2(1.03, 0.32))) {
    	return mix(red, black, m);
    }
    
    if(diamond(-1. * (uv - vec2(0.77, 0.63)), vec2(2., 1.4), 0.05)) {
    	return mix(red, black, m);
    }
    
    if(diamond(uv - vec2(0.9, 0.5), vec2(1., 0.7), 0.05)) {
    	return mix(red, black, m);
    }
    
    if(diamond(uv - vec2(1.03, 0.37), vec2(2., 1.4), 0.05)) {
    	return mix(red, black, m);  
    }
    
    
    
    if(shadow && !sq) {
    	return vec3(0.);
    }else if(sq) {
    	return vec3(.8); 
    }
    return col;
}

vec2 moveCameraZ(vec2 uv, float dist) {
    
    float aspect = 1.8;
            
    uv *= (dist * 0.1);
        
    float mov = dist * 0.05;
    uv -= vec2(mov * aspect, mov);
    
    return uv;
}

float tiltedSin(float t) {
	float c = 0.85;

	return (1./c) * atan((c*sin(t)) / (1. - c*cos(t)));
}

void main()
{    
    float py = uv.y - 0.7;
    float px = uv.x - 0.7;
    
    float d = sqrt(py*py + px*px);

	vec2 nuv = uv;
    
    //camera going away
    
    float n0 = 8.2;
    float n1 = 2.2;
    float n2 = 3.1;
    
    nuv = moveCameraZ(nuv, tiltedSin(max(0., PI - iTime * .2)) * 20.);
	nuv.y -= iTime * 0.008;
	nuv.x -= iTime * 0.002;
    
    if(iTime > 5.) {
    	n0 += iTime * .6 - 5. * .6;
        n1 -= iTime * .6 - 5. * .6;
        n2 += iTime * .6 - 5. * .6;
    }
        
    //noise generation
    vec2 uvc = nuv;
    float m = 1.1;
    
    float n = noise(vec2(uvc * n0)); uvc = m * uvc;
    n += noise(vec2(uvc * n1)); uvc = m * uvc;
    n += noise(vec2(uvc * n2)); uvc = m * uvc;
    
        
    //lines
    vec2 uvr = rotate2D(nuv + vec2(4.13), n * 0.02);
   
    float f = sin(uvr.x * 100.) * .4;

    vec3 basecol = vec3(53., 43., 36.) / 255.;
    vec3 col = basecol + vec3(f) * .03;
    
    //black between planks
    float b = (abs(tan(nuv.x * 8.)) + 1.9) * 0.013;
    col -= vec3(b) * 0.5;
    
    vec2 ruv = rotate2D(nuv - vec2(-1., -0.4), 0.2);
    
    col = card(ruv, col);   
    
    gl_FragColor = vec4(col,1.0);
}
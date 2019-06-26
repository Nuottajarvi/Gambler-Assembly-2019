#version 330
uniform float iTime;
in vec2 uv;
in float isBg;

const float EPSILON = 0.001;
const float end = 100.0;
const float start = 0.01;
const float PI = 3.141592;

layout(location = 0) out vec4 color;

//out vec4 gl_FragColor;

mat3 rotationMatrixY(float rad) {
    return mat3(
        vec3(cos(rad), 0.0, sin(rad)),
        vec3(0.0, 1.0, 0.0),
        vec3(-sin(rad), 0.0, cos(rad))
    );
}

mat3 rotationMatrixX(float rad) {
    return mat3(
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, cos(rad), -sin(rad)),
        vec3(0.0, sin(rad), cos(rad))
    ); 
}

mat3 rotationMatrixZ(float rad) {
    return mat3(
        vec3(cos(rad), -sin(rad), 0.0),
        vec3(sin(rad), cos(rad), 0.0),
        vec3(0.0, 0.0, 1.0)
    );
}


vec2 hash( vec2 x ) {
    const vec2 k = vec2( 0.3183, 0.3678 );
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

float sdfCylinder( vec3 p, vec2 h ) {
	vec2 d = abs(vec2(length(p.xz), p.y)) - h;
	return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float sdfOval( vec3 p, vec3 r ) {
	float k0 = length(p/r);
    float k1 = length(p/(r*r));
    return k0*(k0-1.0)/k1;
}

float bulletSDF(vec3 p) {
	return min(
		sdfCylinder(p.yxz, vec2(.03, .025)),
		sdfOval((p - vec3(0.025, 0., 0.)), vec3(0.05, .03, .03))
	);
}

vec3 getNormal(vec3 p) {
    float E = EPSILON;
    return normalize(vec3(
        bulletSDF(vec3(p.x + E, p.y, p.z)) - bulletSDF(vec3(p.x - E, p.y, p.z)),
        bulletSDF(vec3(p.x, p.y + E, p.z)) - bulletSDF(vec3(p.x, p.y - E, p.z)),
        bulletSDF(vec3(p.x, p.y, p.z + E)) - bulletSDF(vec3(p.x, p.y, p.z - E))
    ));
}

float rayMarch(vec3 eye, vec3 rayDir, float mint, float maxt) {
	float depth = mint;
    for(int i = 0; i < 64; i++) {
   		float dist = bulletSDF(eye + rayDir * depth);
        
        if(dist < EPSILON){
 	      	return depth;
        }else if(depth >= maxt) {
        	return maxt;
        }
        depth += dist * .5;
    }
    return end;
}

void main() {
	if(isBg > 0.) {
		vec3 eye = vec3(-0.3, 0.12, -8.);
		vec3 rayDir = vec3(-.05 + uv.x * .1, -.05 + uv.y * .1, 1.0);

		float time = 1. + iTime;
    
		float maxT = 10.0;
		float dist = rayMarch(eye, rayDir, 0.0, maxT);

		if (dist < maxT - EPSILON) {
			vec3 light = vec3(2., -8., 0.);
			vec3 n = getNormal(eye + rayDir * dist);

			float diffuse = max(0., dot(light, n)) * .2 + .4;

			vec3 viewDir = normalize(-rayDir);
			vec3 specularDir = reflect(normalize(-light), n);
			float specular = pow(max(dot(viewDir, specularDir), 0.0), 32.);

			vec4 hue = vec4(.5, .32, .05, time - 23.5) - abs(noise(((eye + rayDir * dist) * 20.).xy)) * .15;

			color = hue * diffuse + specular;
		} else {
			color = vec4(0., 0., 0., 1.);
		}
	} else {
		color = vec4(1., 1., 0., 1.) * (1. - hash(vec2(iTime, 43.12)).x * .3);
	}
}
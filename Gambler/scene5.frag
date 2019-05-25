#version 140
uniform float iTime;
in vec2 uv;

const float EPSILON = 0.001;
const float end = 100.0;
const float start = 0.01;
const float PI = 3.141592;

const vec3 light = vec3(1., 2., 0.);

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

float terrain(vec2 p) {
	p*=12.;
	return (
		1.5 * noise(p * .25)
		+ 0.12 * noise(p * 2.)
		+ 0.1
	) * .3;
}

float e = 0.001;
vec3 getNormal(vec3 p) {
    return normalize(vec3(
		terrain(vec2(p.x-e,p.z)) - terrain(vec2(p.x+e,p.z)),
		5.*e,
        terrain(vec2(p.x,p.z-e)) - terrain(vec2(p.x,p.z+e))
	));
}

float rayMarch(vec3 eye, vec3 rayDir, float mint, float dt, float maxt) {
	for(float t = mint; t < maxt; t += dt) {
		vec3 p = eye + rayDir * t;
   		float height = terrain(p.xz);
		
		if(p.y < height || p.y < 0.){
			return t - dt;
		}
    }

	return 0.;
}

vec3 rayMarches(vec3 eye, vec3 rayDir) {
    float depth = start;

	const float mint = 0.1f;
	const float dt = 0.01f;
	const float maxt = 30.f;

	float d;
	d = rayMarch(eye, rayDir, mint, dt, maxt);
	d = rayMarch(eye, rayDir, d, dt * .1, d + dt + 0.001);
	d = rayMarch(eye, rayDir, d, dt * .01, d + dt * .1 + 0.0001);

	if(d < mint + dt) {
		return vec3(0.);
	}

	vec3 ip = eye + rayDir * (d + 0.001f); //interpolated point
	vec3 n = getNormal(ip);
	float light = max(0., dot(n, light)) * .3 + 0.05;
	
	//return vec3(ip.y + .5, ip.x, ip.z);

	//return n;

	vec3 texture = vec3(abs(noise(ip.xz * 50.)) * .3 + 0.5);

	return vec3(light * ip.y * 2.) * texture;
}

out vec4 fragColor;
void main() {    
    vec3 eye = vec3(-iTime * .00, 1., -8.0 + iTime * .35);
    vec3 rayDir = rotationMatrixX(-PI / 24.) * vec3(-.05+uv.x*.1, -.05+uv.y*.1, 1.0);
    
    vec3 col = rayMarches(eye, rayDir);
	//vec3 col = vec3(terrain(uv * 20.));

    fragColor = vec4(col,1.0);
}
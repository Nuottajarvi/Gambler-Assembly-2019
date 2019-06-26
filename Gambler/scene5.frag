#version 140
uniform float iTime;
in vec2 uv;

const float EPSILON = 0.001;
const float end = 100.0;
const float start = 0.01;
const float PI = 3.141592;

const vec3 light = vec3(2., 8., 0.);

const float rotSpeed = 0.1;
const float flySpeed = 0.5;

vec2 hash( vec2 x ) {
    const vec2 k = vec2( 0.318, 0.367);
    x = x*k + k.yx;
    return -1.0 + 2.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}

float noise2( vec2 p ) {
    vec2 i = floor( p );
    vec2 f = fract( p );
	
	vec2 u = f*f*(3.0-2.0*f);

    return  mix( mix( dot( hash( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                     dot( hash( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( hash( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                     dot( hash( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

float noise(vec2 p)
{
    return fract(sin(p.x*12.+p.y*525.)*1256.);
}

float smoothNoise(vec2 p)
{
    vec2 id = floor(p*1.);
    vec2 ld = fract(p*1.);
    ld = ld*ld*(3.-2.*ld);
    float bl = noise(id);
    float br = noise(id+vec2(1., 0.));
    float b = mix(bl, br, ld.x);
        
    float tl = noise(id+vec2(0., 1.));
    float tr = noise(id+vec2(1., 1.));
    float t = mix(tl, tr, ld.x);
    
    float bt = mix(b, t, ld.y);
    
    return bt;
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

vec3 getNormalBullet(vec3 p) {
    float E = EPSILON;
    return normalize(vec3(
        bulletSDF(vec3(p.x + E, p.y, p.z)) - bulletSDF(vec3(p.x - E, p.y, p.z)),
        bulletSDF(vec3(p.x, p.y + E, p.z)) - bulletSDF(vec3(p.x, p.y - E, p.z)),
        bulletSDF(vec3(p.x, p.y, p.z + E)) - bulletSDF(vec3(p.x, p.y, p.z - E))
    ));
}

float terrain(vec2 p) {
	p*=12.;
	return (
		1.5 * smoothNoise(p * .25)
		+ 0.12 * smoothNoise(p * 2.)
		+ 0.1
	) * .3 - .25;
}

float e = 0.001;
vec3 getNormalTerrain(vec3 p) {
    return normalize(vec3(
		terrain(vec2(p.x-e,p.z)) - terrain(vec2(p.x+e,p.z)),
		5.*e,
        terrain(vec2(p.x,p.z-e)) - terrain(vec2(p.x,p.z+e))
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
        depth += dist;
    }
    return end;
}

float rayTrace(vec3 eye, vec3 rayDir, float mint, float dt, float maxt) {
	for(float t = mint; t < maxt; t += dt) {
		vec3 p = eye + rayDir * t;
   		float height = terrain(p.xz);
		
		if(p.y < height || p.y < 0.){
			return t - dt;
		}
    }

	return 0.;
}

vec3 rayMarches() {
	//bullet
	float bStart = .1;
	float bEnd = 10.;

	float cameraHeight = mix(-0.12, 1., min(1, iTime * .25));
	
	vec3 bEye = rotationMatrixY(max(0., (iTime - 1.) * rotSpeed)) * vec3(-0.3, cameraHeight, -8.);
	vec3 bRayDir = rotationMatrixY(max(0., (iTime - 1.) * rotSpeed)) *
	rotationMatrixX(mix(0., -PI / 24., min(1, iTime * .25))) *
	vec3(-.05+uv.x*.1, -.05+uv.y*.1, 1.0);
	float dist = rayMarch(bEye, bRayDir, bStart, bEnd);

	if (dist < bEnd ) {
		vec3 n = getNormalBullet(bEye + bRayDir * dist);

		float diffuse = max(0., dot(light, n)) * .2 + .4;

		vec3 viewDir = normalize(-bRayDir);
		vec3 specularDir = reflect(normalize(-light), n);
		float specular = pow(max(dot(viewDir, specularDir), 0.0), 32.);

		vec3 hue = vec3(.5, .32, .05) - abs(noise2(((bEye + bRayDir * dist) * 20.).xy)) * .15;

		return hue * diffuse + specular;
	} else {
		//terrain
		vec3 eye = rotationMatrixY(max(0., (iTime - 1.) * rotSpeed)) * vec3(0., 1., .0) + vec3(iTime * flySpeed, 0., 0.);
		vec3 rayDir = rotationMatrixY(max(0., (iTime - 1.) * rotSpeed)) *
		rotationMatrixX(mix(0., -PI / 24., min(1, iTime * .25))) *
		vec3(-.05+uv.x*.1, -.05+uv.y*.1, 1.0);
		float depth = start;

		const float mint = 0.1f;
		const float dt = 0.01f;
		const float maxt = 16.f;

		float d;
		d = rayTrace(eye, rayDir, mint, dt, maxt);
		d = rayTrace(eye, rayDir, d, dt * .1, d + dt + 0.001);
		d = rayTrace(eye, rayDir, d, dt * .01, d + dt * .1 + 0.0001);

		if(d < mint + dt) {
			return vec3(0.);
		}

		vec3 ip = eye + rayDir * (d + 0.001f); //interpolated point
		vec3 n = getNormalTerrain(ip);
		float light = max(0., dot(n, light)) * .3 + 0.05;
	
		//return vec3(ip.y + .5, ip.x, ip.z);
		//return n;

		//vec3 texture = vec3(mod(ip.x, 1.));
		vec3 texture = vec3(abs(noise2(ip.xz * 50.)) * .3 + 0.5);

		return vec3(light * ip.y * 2.) * texture;
	}
}

out vec4 fragColor;
void main() {
    vec3 col = rayMarches();

    fragColor = vec4(col, 1.0);
}
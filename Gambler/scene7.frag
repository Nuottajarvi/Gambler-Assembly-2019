#version 130
uniform float iTime;
in vec2 uv;
uniform sampler2D glassTex;

out vec4 color;

const float ar = 1.8;
const float EPSILON = 0.000001;
const float start = 0.01;
const float end = 100.0;
const float PI = 3.14159;

const vec3 purple = vec3(42., 8., 59.) / 255.;
const vec3 floorCol = vec3(158., 99., 47.) / 255.;
const vec3 ballPos = vec3(.2, -0.15, 0.);

vec3 light = vec3(2., 1., -2.);//vec3(-8., 6., -2.);

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
    return fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}

vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

vec3 rainbow(float a) {
	return hsb2rgb(vec3(
		a,
		1.,
		1.
	));
}

float angle(vec2 vec) {
	vec = normalize(vec);
	float dir = cross(vec3(1., 0., 0.), vec3(vec, 0.)).z;
	dir = 1.;
	return mod(acos(dot(vec2(1., 0.), vec)) * dir + PI,  2. * PI);
}

vec3 colPillar(vec3 p) {
	if(mod(angle(p.xz) + PI / 6., PI / 3.) < PI / 64.) {
			return vec3(0., 1., 1.);
	} else if(mod(angle(abs(p.xz)), PI / 3.) < PI / 32.) {
		if(mod(p.y * 30., 1.) < 0.1) {
			//wall
			return purple;
		} else {
			//lights
			return rainbow(
				floor(p.y * 30.) / 30. + floor(iTime * 4.) / 30.
			) * 5.;
		}
	}
	return purple;
}

vec2 unedge(vec2 p) {
	p *= 0.5;
    p += 0.25;
    return p;
}

float getCol(vec2 p) {
    return mod(p.x, 2.) * .5 + mod(p.y + 1., 2.) * .5 + .5; 
}

vec3 floorTexture(vec2 p) {
	p *= 20.;
	vec2 i = floor(p);//int
	vec2 f = fract(p);//frac
	float dist = 99.;
    float shade = 0.;
    
    for(int x = -1; x <= 1; x++) {
        for(int y = -1; y <= 1; y++) {
            
			vec2 point = unedge(hash(i + vec2(x,y))) + vec2(x,y);
            float newDist = length(point - f);
            
            if(newDist < dist) {
                if(dist - newDist < 0.05){
                	shade = 0.;   
                } else {
                	shade = getCol(i + vec2(x,y));
                }
            	dist = newDist;
            }else if(abs(newDist - dist) < 0.05) {
                shade = 0.;
            }
        }
    }
    
	return shade * floorCol * .7;
}

vec4 sdfPlane(vec3 p, vec4 n, float dist) {
	vec3 tex = floorTexture(p.xz);
	return vec4(tex, dot(p, n.xyz) + n.w);
}

bool intersectPlane(vec3 n, vec3 p0, vec3 eye, vec3 rayDir, out float t) {
	float denom = dot(n, rayDir);
	if(denom > EPSILON) {
		vec3 p0l0 = p0 - eye;
		t = dot(p0l0, n) / denom;
		return (t >= 0.);
	}
	return false;
}

vec4 sdfPillar( vec3 p, vec2 h ) {
	vec2 d = abs(vec2(length(p.xz) + min(0., p.y * p.y * p.y * 8.), p.y)) - h;
			
	float diffuse = max(0., dot(light, vec3(p.x, 0., p.z))) * .2 + .4;

	vec3 pillarCol = colPillar(p) * diffuse;
	pillarCol *= 1. - vec3(max(0., -p.y - 0.1) * 10.);
	return vec4(
		pillarCol,
		min(max(d.x, d.y), 0.0) + length(max(d, 0.0))
	);
}

vec4 sdfBall(vec3 p, float s) {
	vec3 b = vec3(s);
	vec3 d = abs(p) - b;

	float dist = length(p) - s;

	vec3 col;

	if(abs(p.z) < abs(p.x)) {
		 col = texture(glassTex, (p - vec3(-.1)).zy * 5.).rgb;
	} else {
		 col = texture(glassTex, (p - vec3(-.1)).xy * 5.).rgb;
	}
	
	return vec4(col, dist);
}

vec4 SDF(vec3 p, float depth, inout bool doReflect) {
	vec3 dist = vec3(.75, 0., .75);
	vec3 modp = mod(p, dist) - dist * .5;
	vec4 pillar = sdfPillar(modp, vec2(.05, .25));
	vec4 ball = sdfBall(p + ballPos, 0.05);

	doReflect = false;
	if(ball.a < pillar.a) {
		doReflect = true;
		return ball;
	} else {
		return pillar - vec4(pillar.rgb * vec3(depth * .04), 0.);
	}
}

vec3 getNormal(vec3 p) {
    float E = EPSILON;
	bool b;
    return normalize(vec3(
        SDF(vec3(p.x + E, p.y, p.z), 0., b).a - SDF(vec3(p.x - E, p.y, p.z), 0., b).a,
        SDF(vec3(p.x, p.y + E, p.z), 0., b).a - SDF(vec3(p.x, p.y - E, p.z), 0., b).a,
        SDF(vec3(p.x, p.y, p.z + E), 0., b).a - SDF(vec3(p.x, p.y, p.z - E), 0., b).a
    ));
}

vec4 rayMarch(vec3 eye, vec3 rayDir, float mint, float maxt, inout vec3 refPos, inout vec3 refDir, inout bool doShadow) {
	float depth = mint;

	vec4 floorData;
	vec4 data;
	vec4 floorCol;

	float angleCos = dot(vec3(0., -1., 0.), rayDir);
	float floorDist;

	bool hit = intersectPlane(vec3(0., 1., 0.), vec3(0., 0.2, 0.), eye, rayDir, floorDist);
	if(hit) {
		vec3 p = eye + rayDir * floorDist;
		floorCol = vec4(floorTexture((eye + rayDir * floorDist).xz) - vec3(length(p.xz * .1)), 1.);
	}
	
	depth = mint;

    for(int i = 0; i < 255; i++) {
		bool doReflect = false;
   		data = SDF(eye + rayDir * depth, depth, doReflect);
		
		float dist = data.a;

		if(depth > floorDist + EPSILON && hit) {
			return floorCol;
		}

        if(dist < EPSILON){
			if(doReflect) {
				refPos = eye + rayDir * depth;
				refDir = reflect(rayDir, getNormal(refPos));
				//refPos + ballPos));
			}
			float light = max(0., dot(getNormal(eye + rayDir * depth), vec3(1., 0., 0.))) * 0.8 + 0.2;
			doShadow = false;
			return vec4(data.xyz * light, depth);
        }else if(depth >= maxt) {
        	return vec4(vec3(0.), maxt);
        }
        depth += dist;// 0.8;
    }

	if(hit) {
		return floorCol;
	}
	
    return vec4(vec3(0.), maxt);
}

vec3 shadow(vec3 p) {
	vec3 dir = vec3(0., -1., 0.);
	vec3 nullV = vec3(0.);
	bool nullB = false;
	float end = 2.;
	vec4 data = rayMarch(p, dir, .02, end, nullV, nullV, nullB);

	if(data.w >= end - 1.) {
		return vec3(0.);
	} else {
		return vec3(.5);
	}
}

void main() {

	mat3 rot = rotationMatrixY(-iTime * .025 + 0.075);
	vec3 eye = rot * 
	vec3(0., 0.12, -2.5) - vec3(0.4, 0., 0.);
	vec3 rayDir = rotationMatrixX(sin(iTime * 0.5) * 0.05 + 0.012) * rot *
	 vec3(-.05 + uv.x * .1, -.05 + uv.y * .1, 1.0);
    
	vec3 refPos;
	vec3 refDir;
	bool doShadow = false;
	vec4 data = rayMarch(eye, rayDir, 0., end, refPos, refDir, doShadow);
	
	float dist = data.a;
	vec3 p = eye + rayDir * dist;
	vec3 n = getNormal(p);

	if(length(refPos) > 0.1) {
	    vec3 nullV = vec3(0.);
	    bool nullB = false;
		vec3 increasedPos = (refPos + ballPos) * 1.1 - ballPos;
		data *= 0.5;
		data += rayMarch(increasedPos, refDir, 0.0, end, nullV, nullV, nullB);

		data = max(vec4(0.), data);
		data += vec4(0.02);

		vec3 viewDir = normalize(-rayDir);
		vec3 specularDir = reflect(normalize(light), n);
		float specular = pow(max(dot(viewDir, specularDir), 0.0), 32.);

		data.w = 0.;

		data += vec4(vec3(specular), 0.);
	}

	if (dist < end - EPSILON) {
		vec3 shadowAmt = vec3(0.);
		if(doShadow) {
			shadowAmt = shadow(p);
		}

		vec4 startFade = mix(
			vec4(0.),
			vec4(data.rgb - shadowAmt, 1.),
			min(1., max(0., iTime - .5))
		);

		color =	mix(
			startFade,
			vec4(0.),
			min(1., max(0., iTime - 29.))
		);

		//color = vec4(data.rgb - shadowAmt, 1.);
		//color = vec4(shadow(p), 1.);
	} else {
		color = vec4(0., 0., 0., 1.);
	}
}
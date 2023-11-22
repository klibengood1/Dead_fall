uniform float time;
uniform vec2 res;
uniform float amplitude;
uniform float amplitude2;

float rand(vec2 coord){
	// prevents randomness decreasing from coordinates too large
	coord = mod(coord, 10000.0);
	// returns "random" float between 0 and 1
	return fract(sin(dot(coord, vec2(12.9898,78.233))) * 43758.5453);
}

float perlin_noise(vec2 coord) {
	vec2 i = floor(coord);
	vec2 f = fract(coord);
	
	// 4 corners of a rectangle surrounding our point
	// must be up to 2pi radians to allow the random vectors to face all directions
	float tl = rand(i) * 6.283;
	float tr = rand(i + vec2(1.0, 0.0)) * 6.283;
	float bl = rand(i + vec2(0.0, 1.0)) * 6.283;
	float br = rand(i + vec2(1.0, 1.0)) * 6.283;
	
	// original unit vector = (0, 1) which points downwards
	vec2 tlvec = vec2(-sin(tl), cos(tl));
	vec2 trvec = vec2(-sin(tr), cos(tr));
	vec2 blvec = vec2(-sin(bl), cos(bl));
	vec2 brvec = vec2(-sin(br), cos(br));
	
	// getting dot product of each corner's vector and its distance vector to current point
	float tldot = dot(tlvec, f);
	float trdot = dot(trvec, f - vec2(1.0, 0.0));
	float bldot = dot(blvec, f - vec2(0.0, 1.0));
	float brdot = dot(brvec, f - vec2(1.0, 1.0));
	
	// putting these values through abs() gives an interesting effect
//	tldot = abs(tldot);
//	trdot = abs(trdot);
//	bldot = abs(bldot);
//	brdot = abs(brdot);
	
	vec2 cubic = f * f * (3.0 - 2.0 * f);
	
	float topmix = mix(tldot, trdot, cubic.x);
	float botmix = mix(bldot, brdot, cubic.x);
	float wholemix = mix(topmix, botmix, cubic.y);
	
	return 0.5 + wholemix;
}

void main() {
	vec4 color = texture2D(u_texture, v_texCoords);
	float t = perlin_noise(v_worldPos * (1.0 / res) * amplitude + vec2(-time, time));
	float t2 = perlin_noise(v_worldPos * (1.0 / res) * amplitude2 + vec2(-time, time) + 2);
	//color = mix(color, vec4(color.g, color.b, color.r, color.a), t);
	float cc = (color.r + color.g + color.b) / 3;
	vec4 tcol = mix(vec4(0, 1, 0, 1), vec4(1, 0, 0.5, 0.7) + color * vec4(0, cc, 0, 1), color.a * t2 * 2);
	color += tcol * abs(sin(v_worldPos.y * (1.0 / res.y) * amplitude + time + t2));
	//color = mix(color, vec4(1, 1, 1, 1), t * color.a);
	
	gl_FragColor = color * v_color;
}

uniform sampler2D u_liquid;
uniform sampler2D u_diffusion;
uniform sampler2D u_effects;
uniform sampler2D u_background;
uniform sampler2D u_noLiquids;
uniform sampler2D u_noise;
uniform float time;
uniform vec2 res;
uniform vec2 waveAmplitude;// = vec2(0.03, 0.03);
uniform vec2 waveLength;// = vec2(12.0, 12.0);
uniform float waveSpeed;// = 0.004;
uniform float border;// = 2.0;
uniform float borderWidth;// = 4.0;
uniform int reflections;// = 1;
uniform float reflectionsQuality;// = 0.5;
uniform float diffraction;// = 2.0;

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
	vec4 noLiquids = texture2D(u_noLiquids, v_texCoords);
	vec4 diffCol = texture2D(u_diffusion, v_texCoords);
	vec2 mot = vec2( perlin_noise(v_worldPos * waveAmplitude + vec2(-time, time) * waveSpeed) );
	vec2 waterOffs = (mot - 0.5) * 2 * waveLength * (1.0 / res);
	waterOffs += (diffCol.rg - 0.5) * 2 * (1.0 / res) * waveLength * 4.0 * diffCol.a;
	
	vec4 liquidColor = texture2D(u_liquid, v_texCoords + waterOffs);
	liquidColor.a *= (1.0 - noLiquids.a * (1.0 - diffCol.a));

	if (border > 0) {
		float a = 0;
		int count = 0;
		vec2 scl = 1.0 / res * borderWidth;
		int r = 2;
		for (int y = -r; y <= r; y++) {
			for (int x = -r; x <= r; x++) {
				a += texture2D(u_liquid, v_texCoords + waterOffs + scl * vec2(x, y)).a;
				count++;
			}
		}
		a /= count;
		float aa = smoothstep(0, liquidColor.a, liquidColor.a - a);
		liquidColor = mix(liquidColor, liquidColor * border, aa);
	}
	
	vec4 sceneColor = texture2D(u_texture, v_texCoords - waterOffs * liquidColor.a * diffraction) * v_color;
	
	if (reflections > 0 && liquidColor.a > 0.1) {
		float reflectionLength = 60;
		vec2 currentCoord = v_texCoords + waterOffs * diffraction;
		for (float i = 0; i < reflectionLength; i += reflectionsQuality) {
			vec2 offset = vec2(0.0, i) / res;
			vec2 surfaceCoord = currentCoord + offset;
			vec4 surfaceColor = texture2D(u_liquid, surfaceCoord);
			if (surfaceColor.a < 0.01) {
				vec2 reflectionCoord = surfaceCoord + abs(surfaceCoord - currentCoord);
				if (reflectionCoord.y <= 1.0) {
					vec3 reflectionColor = texture2D(u_texture, reflectionCoord).rgb;
					reflectionColor += texture2D(u_effects, reflectionCoord).rgb;
					reflectionColor += texture2D(u_background, reflectionCoord).rgb * (1 - texture2D(u_texture, reflectionCoord).a);
					float intensity = smoothstep(reflectionLength - 1, 0.0, i) * liquidColor.a * 2.5;
					sceneColor.rgb += reflectionColor * intensity;
					// sceneColor.rgb += texture2D(u_liquid, reflectionCoord).rgb * intensity * 0.5;
					break;
				
				}
			}
		}		
	}
	
	// fragColor = vec4(mix(sceneColor.rgb, liquidColor.rgb, liquidColor.a), max(sceneColor.a, liquidColor.a));
	// fragColor = sceneColor + liquidColor;
	gl_FragColor = vec4(mix(sceneColor.rgb, liquidColor.rgb, liquidColor.a), sceneColor.a + liquidColor.a);
}

uniform float time;
uniform vec2 res;
uniform float heatEffect;
uniform int post;

uniform sampler2D u_blast;
uniform int shockwaveEnabled;
uniform float aberration;

uniform float gamma;
uniform float contrast;
uniform float saturation;

uniform sampler2D u_texTiles;
uniform sampler2D u_texFloors;
uniform vec2 sunPosition;
uniform vec4 raysColor;

uniform vec4 blurColor;

uniform int shadows;
uniform sampler2D u_texFront;
uniform sampler2D u_texBack;
uniform sampler2D u_texEffects;

void main() {
	vec2 texCoords = v_texCoords;
	
	// HEAT EFFECT
	if (heatEffect > 0) {
		vec2 step = 1.0 / res * heatEffect;
		vec4 cl = texture2D(u_texture, texCoords);
		float offs = (cl.r * 0.25 + cl.g * 0.4 + cl.b * 0.35) * 20.0;
		
		texCoords.x += sin(v_worldPos.y / 2 + time * 0.05 + offs) * step.x;
		texCoords.y += cos(v_worldPos.x / 2 + time * 0.05 + offs) * step.y;
		//col = texture2D(u_texture, texCoords);
	}

	vec4 col = texture2D(u_texture, texCoords);
	
	// SHOCKWAVE EFFECT	
	if (shockwaveEnabled > 0) {
		vec4 displacement = texture2D(u_blast, texCoords);
		vec2 offset = (displacement.rg - 0.5) * 2 * 0.1 * displacement.a;
		offset *= 2;
		offset.x /= (res.x / res.y);
		col = texture2D(u_texture, texCoords + offset);
		
		if (aberration > 0) {
			col = (texture2D(u_texture, texCoords + offset) + 
				   texture2D(u_texture, texCoords + offset * (1.0 - aberration)) * vec4(1, 0.5, 0, 1) + 
				   texture2D(u_texture, texCoords + offset * (1.0 + aberration)) * vec4(0, 0.5, 1, 1)
				   ) * vec4(0.5, 0.5, 0.5, 0.33);
		}

		float border = step(abs(texCoords.x + offset.x - 0.5), 0.5) * 
					   step(abs(texCoords.y + offset.y - 0.5), 0.5);
		col.rgb = col.rgb * border + (1 - border) * texture2D(u_texture, texCoords).rgb;
		
		texCoords += offset;
	}
	
	// BLUR EFFECT
	if (blurColor.a > 0.0) {
		vec2 diff = vec2(0.5, 0.5) - texCoords;
		vec2 dir = normalize(diff) / res;
		vec3 outcol = vec3(0.0);
		float samples = max(20.0, 1.0);
		for (float i = 0; i < samples; i++) {
			float iter = (1.0 - 0.85 * smoothstep(0.0, samples - 1.0, i)) * samples * 2.0;
			outcol += texture2D(u_texture, texCoords + dir * iter).rgb / samples;
		}
		//col.rgb = mix(col.rgb, outcol, smoothstep(0.0, samples / 2, length(diff) * samples));
		col.rgb = mix(col.rgb, outcol * blurColor.rgb, blurColor.a);
	}

	// SUN RAYS EFFECT	
	if (raysColor.a > 0) {
		vec2 rayCenter = sunPosition / res;
		rayCenter.y = 1.0 - rayCenter.y;
		vec2 ray = texCoords - rayCenter;
		vec3 rayColor = vec3(0.0);
		float intens = 0.0;

		float samplesCount = 100;
		for(float i = 0; i < samplesCount; i++) {
			float scale = 1.0 - 1.0 * (i / (samplesCount - 1));
			vec2 rayCoord = (ray * scale) + rayCenter;
			rayColor += texture2D(u_texture, rayCoord).rgb / samplesCount * raysColor.rgb;
			intens += texture2D(u_texTiles, rayCoord).a / samplesCount;
			intens += texture2D(u_texFloors, rayCoord).a / samplesCount;
		}
		col.rgb += rayColor * smoothstep(1.0, 0.0, length(ray) * 0.47) * raysColor.a * (1.0 - min(intens * 2, 1.0));
		// col.rgb *= mix(1.0, 0.35, intens * raysColor.a);
	}
	// COLOR CORRECTION
	col.rgb = pow(col.rgb, vec3(1.0 / gamma));
	col.rgb = (col.rgb - 0.5) * contrast + 0.5;
	col.rgb = mix(vec3(dot(col.rgb, vec3(0.33, 0.33, 0.33))), col.rgb, saturation);
	
	// POST EFFECTS

	if (post > 0) {
		if (int(gl_FragCoord.x) / 1 % 2 != int(gl_FragCoord.y) / 1 % 2) {
			if (post == 1) {
				col = vec4(col.b + col.r, col.r, col.g, col.a) * vec4(1.3, 1.1, 1.1, 1);
			}
			if (post == 2) {
				float mid = (col.r + col.g + col.b) / 3.0;
				col = vec4(mid, mid, mid, col.a);
			}
			if (post == 3) {
				col += (col * vec4(1.4, 1.2, 1.2, 1));
			}
			if (post == 6) {
				vec2 tex = texCoords;
				vec2 step = 1.0 / res * 2.0;
				float offs = (col.r * 0.25 + col.g * 0.4 + col.b * 0.35);
				
				tex.x += sin(v_worldPos.y / 8 + time * 0.05 + offs * 100.0) * step.x;
				tex.y += cos(v_worldPos.x / 8 + time * 0.05 + offs * 100.0) * step.y;
				col = texture2D(u_texture, tex);
			}
		}
		if (post == 4) {
			float mid = (col.r * 0.25 + col.g * 0.4 + col.b * 0.35);
			col = vec4(mid * 2.0, mid * 1.5, mid, col.a);
		}
		if (post == 5) {
			float mid = (col.r * 0.25 + col.g * 0.4 + col.b * 0.35);
			col += col * mid * 1.6;
			if (mid >= 0.5) col += col * 0.5;
		}
		if (post == 7) {
			col = vec4(col.r, col.g + col.r * 0.5, col.b, col.a);
			col.rgb -= abs(sin(v_worldPos.y * 8 + time * 0.05)) * 0.3;
		}
		if (post == 8) {
			col = vec4(col.r + col.g * 0.5, col.g, col.b, col.a);
			col -= abs(sin(v_worldPos.y * 8 * (1.0 / res.y) + time * 0.05)) * 0.3;
		}
		if (post == 9) {
		}
	}
	/*
	vec2 tex = texCoords;
	vec2 step = 1.0 / res * (sin(v_worldPos.x * 0.2 + time * 0.05 * 0) + cos(v_worldPos.y * 0.2 + time * 0.05 * 0)) * 1.0;
	col = (col +
		     texture2D(u_texture, tex + step) * vec4(0.0, 2.0, 2.0, 1.0) + 
			 texture2D(u_texture, tex - step) * vec4(3.0, 0.0, 0.0, 1.0)) * vec4(0.25, 0.33, 0.33, 0.33);
	*/
	if (shadows > 0) {
		//vec2 shadowDir = vec2(-8.0, 12.0) * (1.0 / res);
		vec2 shadowDir = vec2(-16.0, 24.0) * 2 * (1.0 / res);
		vec4 shadowCol;
		float shadowSamples = 28.0 * 2;
		for (float i = 0.0; i < shadowSamples; i++) {
			vec2 dir = shadowDir * mix(0.4, 1.0, smoothstep(0, shadowSamples - 1, i));
			vec4 c1 = texture2D(u_texFront, texCoords + dir);
			vec4 c2 = texture2D(u_texBack, texCoords + dir);
			vec4 c3 = texture2D(u_texEffects, texCoords + dir);
			shadowCol += (c1 + c2 + c3) / shadowSamples;
		}
		col.rgb = mix(col.rgb, shadowCol.rgb * (1.0 - shadowCol.a), shadowCol.a);
		//vec4 frontCol = texture2D(u_texFront, texCoords + shadowDir);
		//col.rgb = mix(col.rgb, vec3(0.0, 0.0, 0.0), frontCol.a * 0.5);
	}
	
	gl_FragColor = col * v_color;
	//fragColor = col * v_color;
}

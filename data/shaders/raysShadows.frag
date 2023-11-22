uniform sampler2D u_shadows;
uniform float time;
uniform vec2 res;
uniform vec3 ambientLight;
uniform float smoothRadius;
uniform float lightAbsorb;
uniform float maxAccums;

struct Light {
	vec2 pos;
	vec4 color;
	float radius;
	float dir;
	float dirCutoff;
	float dirCutoffOffset;
	float rayOffset;
};

uniform int lightsCount;
uniform Light lights[100];

float diffAngleAbs(float angle1, float angle2) {
	float diff = int(abs(angle1 - angle2)) % 360;
	return diff > 180 ? 360 - diff : diff;
}

void main() {
	vec3 finalLight = vec3(ambientLight);
	vec2 pixelPos = v_texCoords * res;
	
	for (int i = 0; i < lightsCount; i++) {
		Light l = lights[i];
		vec2 lightPos = vec2(l.pos.x, res.y - l.pos.y);
		float dist = length(pixelPos - lightPos);
		
		float cutoff = 1.0;

		if (l.dirCutoff > 0.0) {
			float dirCutoff = mix(360.0, l.dirCutoff, smoothstep(0, l.dirCutoffOffset, dist));
			vec2 dir = normalize(pixelPos - lightPos);
			float diffAng = diffAngleAbs(degrees(atan(dir.y, dir.x)), l.dir);
			if (l.rayOffset != 0.0) {
				float swing = smoothstep(0.0, l.radius, dist);
				if (l.rayOffset < 0.0) swing = 1.0 - l.rayOffset;
				diffAng *= (1.0 + swing * abs(l.rayOffset));
			}
			cutoff -= smoothstep(dirCutoff * 0.05, dirCutoff * 1.05, diffAng);
		}
		
		vec3 light;
		
		if (dist <= l.radius) {
			light = l.color.rgb * (1 - smoothstep(l.radius * smoothRadius, l.radius, dist)) * l.color.a * cutoff;

			float maxSamples = dist * 2;
			maxSamples = dist + 10;
			maxSamples = dist;
			maxSamples = dist / 2;
			vec2 startPos = lightPos / res;
			
			if (cutoff > 0.0) {
				int accums = 0;
				for (float c = 0; c < maxSamples; c++) {
					// vec2 rayCoord = mix(startPos, v_texCoords, smoothstep(0.0, maxSamples - 1, c));
					vec2 rayCoord = startPos + (v_texCoords - startPos) * (c / (maxSamples - 1));
					vec4 shadowColor = texture2D(u_shadows, rayCoord);
					
					// light *= mix(vec3(1, 1, 1), shadowColor.rgb, shadowColor.a * 0.25);
					// light *= (1 - shadowColor.a * lightAbsorb);
					if (shadowColor.a > 0) accums++;
					if (accums > maxAccums) light -= shadowColor.a * lightAbsorb;
					
					float lightValue = (light.r + light.g + light.b) / 3;
					if (lightValue <= 0.0) {
						light = vec3(0, 0, 0);
						break;
					}
				}	
			}
			
			finalLight += light;
		}
	}
	
	gl_FragColor = vec4(finalLight, 1.0) * v_color;
}

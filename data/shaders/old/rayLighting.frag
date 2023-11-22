#ifdef GL_ES
#define LOWP lowp
precision mediump float;
#else
#define LOWP
#endif
attribute LOWP vec4 v_color;
attribute vec2 v_texCoords;
attribute vec2 v_worldPos;
varying vec4 fragColor;
uniform sampler2D u_texture;

struct Light {
	vec2 pos;
	vec4 color;
	float radius;
};

const uniform int lightsCount = 10;
uniform Light lights[50];

uniform sampler2D u_shadows;
uniform float time;
uniform vec2 res;

void main() {
	vec2 texCoords = vec2(v_texCoords.x, 1.0 - v_texCoords.y);
	vec4 col = texture(u_texture, v_texCoords);
	
	vec4 sum;
	for (int l = 0; l < lightsCount; l++) {
		Light light = lights[l];
		
		float dist = length(light.pos - texCoords * res);
		if (dist < light.radius) {
			float samples = dist;
			vec4 diffColor = light.color * smoothstep(0.0, light.radius, light.radius - dist);
			
			for (float i = 0; i < samples; i++) {
				float scale = 1.0 * (i / (samples - 1));
				vec2 lightPos = light.pos / res;
				//vec2 rayCoord = lightPos + (texCoords - lightPos) * scale;
				vec2 rayCoord = mix(lightPos, texCoords, smoothstep(0.0, samples - 1, i));
				//sum += light.color / samples;
				//diffColor *= (1 - texture2D(u_shadows, vec2(rayCoord.x, 1.0 - rayCoord.y)).a * 0.2);
				//if (diffColor.a < 0.05) break;
				if (texture2D(u_shadows, vec2(rayCoord.x, 1.0 - rayCoord.y)).a > 0.5) {
					//diffColor.rgb *= 0.5;
					diffColor.rgb = vec3(0.0);
					break;
				}
			}
			
			sum += diffColor;
		}
	}
	//sum /= lightsCount;
	col.rgb = col.rgb * sum.rgb;
	gl_FragColor = col * v_color;
}

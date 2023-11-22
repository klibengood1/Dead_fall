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

uniform float time;
uniform vec2 res;
uniform sampler2D u_mask;
uniform sampler2D u_noise;

void main() {
	
	vec2 sample;
	sample.x = sin(v_worldPos.y * 0.02) * 0.5 + 0.5;
	sample.y = sin(v_worldPos.x * 0.02) * 0.5 + 0.5;
	vec2 waveLength = vec2(2.0, 2.0);
	vec2 offs = (texture2D(u_noise, sample).rg - 0.5) * 2 * (1.0 / res) * waveLength;
	vec2 texCoords = v_texCoords + offs;
	texCoords = v_texCoords;
	
	vec4 mask = texture(u_mask, texCoords);
	vec4 sceneCol = texture(u_texture, texCoords) * v_color;
	
	float a = 0;
	int count = 0;
	vec2 scl = 1.0 / res * 1;
	int r = 3;
	// vec3 sum;
	for (int y = -r; y <= r; y++) {
		for (int x = -r; x <= r; x++) {
			vec2 tc = texCoords + scl * vec2(x, y);
			a += texture(u_mask, tc).a;
			// sum += texture(u_texture, tc).rgb;
			count++;
		}
	}
	// sum /= count;
	// sceneCol.rgb = (sum * 0.8) + texture(u_texture, texCoords).rgb * 0.2;
	a /= count;
	if (a <= 0.8) {
		sceneCol.rgb *= (a * 0.75);
	}
	
	gl_FragColor = sceneCol * mask;
}

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

uniform sampler2D u_shadows;
uniform float time;
uniform vec2 res;

void main() {
	vec4 col = texture(u_texture, v_texCoords);
	
	vec2 rayCenter = vec2(0.2, 0.9);
	rayCenter.y = 1.0 - rayCenter.y;
	vec2 ray = v_texCoords - rayCenter;
	vec4 shadowColor = vec4(0.0);
	float intens = 0.0;

	float samplesCount = 60;
	for(float i = 0; i < samplesCount; i++) {
		float scale = 1.0 - 0.1 * (i / (samplesCount - 1));
		//scale = max(0.7, scale);
		//scale = max(0.5, scale);
		vec2 rayCoord = (ray * scale) + rayCenter;
		shadowColor += texture2D(u_shadows, rayCoord) / samplesCount;
	}
	col.rgb = mix(col.rgb, col.rgb * shadowColor.a * 0.2, shadowColor.a * 1.0);
	//col.rgb *= col.rgb * vec3(1.0, 0.6, 0.0) * (1.0 - shadowColor.a) * 3;
	
	gl_FragColor = col * v_color;
}

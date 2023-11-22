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
uniform sampler2D u_noise;

uniform vec3 dyeColor;

void main() {
	vec2 sample;
	sample.x = sin(v_worldPos.y * 0.1) * 0.5 + 0.5;
	sample.y = sin(v_worldPos.x * 0.1) * 0.5 + 0.5;
	//vec3 rgbOffset = (texture2D(u_noise, sample).rgb - 0.5) * 2;

	vec4 col = texture2D(u_texture, v_texCoords);
	vec4 src = texture2D(u_texture, v_texCoords);
	float sat = dot(src.rgb, vec3(0.33));
	src.rgb = mix(vec3(sat) * dyeColor * (1.0 + (1.0 - sat) * 0.5), dyeColor, (1.0 - sat) * 0.4);
	src.rgb = mix(src.rgb, col.rgb * dyeColor * vec3(0.3), dot(texture2D(u_noise, sample).rgb, vec3(0.33)) * 0.5);
	gl_FragColor = src * v_color;
}

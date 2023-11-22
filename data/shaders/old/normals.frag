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

void main() {
	vec4 col = texture(u_texture, v_texCoords);
	col.rgb = mix(vec3(0.5, 0.5, 1), col.rgb, v_color.a);
	gl_FragColor = vec4(col.rgb, 1.0) * v_color;
}

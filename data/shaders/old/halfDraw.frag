#ifdef GL_ES
#define LOWP lowp
precision mediump float;
#else
#define LOWP
#endif
attribute LOWP vec4 v_color;
attribute vec2 v_texCoords;
varying vec4 fragColor;
attribute vec2 v_worldPos;
uniform sampler2D u_texture;

void main() {
	if (v_texCoords.y > 0.5) discard;
	gl_FragColor = texture(u_texture, v_texCoords) * v_color;
}

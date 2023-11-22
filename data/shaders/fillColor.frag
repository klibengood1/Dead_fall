uniform vec4 v_fillcolor;

void main() {
	vec4 tcolor = texture2D(u_texture, v_texCoords);
	gl_FragColor = v_fillcolor * vec4(1, 1, 1, tcolor.a);
}

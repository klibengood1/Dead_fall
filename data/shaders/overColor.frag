uniform vec4 targetColor;
uniform float power;

void main() {
	vec4 tcolor = texture2D(u_texture, v_texCoords) * v_color;
	tcolor.r += (targetColor.r - tcolor.r) * power;
	tcolor.g += (targetColor.g - tcolor.g) * power;
	tcolor.b += (targetColor.b - tcolor.b) * power;
	tcolor.a *= targetColor.a;
	gl_FragColor = tcolor;
}

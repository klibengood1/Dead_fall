uniform vec2 res;
uniform vec2 pos;
uniform float opticalRadius;

void main() {
	vec2 cPos = vec2(v_texCoords.x, 1.0 - v_texCoords.y) * res;
	float a = smoothstep(opticalRadius * 0.6, opticalRadius * 1.0, length(pos - cPos));
	vec4 tColor = texture2D(u_texture, v_texCoords);
	tColor = mix(tColor, vec4(0, 0, 0, 1), a);
	// tColor.a *= a;
	gl_FragColor = tColor * v_color;
}

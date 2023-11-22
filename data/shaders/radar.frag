uniform vec2 texRes;
uniform float radius;
uniform float _smooth;

void main() {
	vec4 fadeColor = vec4(1.0, 1.0, 1.0, 1.0);
	float len = length(texRes * (v_texCoords - vec2(0.5, 0.5)));
	fadeColor.a *= (1.0 - smoothstep(radius - _smooth, radius + _smooth, len));
	
	gl_FragColor = texture2D(u_texture, v_texCoords) * fadeColor * v_color;
}
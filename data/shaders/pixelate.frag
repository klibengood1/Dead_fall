uniform vec2 pixelateScale;
uniform vec2 res;
uniform float scale;

void main() {
	
	vec2 Coord = v_texCoords;
	if (pixelateScale.x > 0.0 || pixelateScale.y > 0.0) {
		Coord = (floor(gl_FragCoord.xy / pixelateScale) * pixelateScale + 0.5) / res;
	}
	
	float offs = scale;
	Coord = offs + Coord * (1 - offs * 2);
	if (Coord.x < 0 || Coord.x > 1.0 || Coord.y < 0 || Coord.y > 1.0) {
		gl_FragColor = vec4(0, 0, 0, 1);
		discard;
	}
	
	gl_FragColor = texture2D(u_texture, Coord);
}
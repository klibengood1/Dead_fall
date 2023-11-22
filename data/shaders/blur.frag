uniform float time;
uniform vec2 res;
uniform int blurRadius;
uniform float blurPower;
uniform int dir;

void main() {
	if (blurRadius > 0 && blurPower > 0) {
		vec4 sum;
		int count = 0;
		vec2 offset;
		if (dir > 0) {
			offset = vec2(1, 0);
		} else {
			offset = vec2(0, 1);
		}
		
		for (float i = -blurRadius; i < blurRadius + 1; i++) {
			sum += texture2D(u_texture, v_texCoords + 1.0 / res * offset * i);
			// sum += texture2D(u_texture, v_texCoords + 1.0 / res * offset * i) * smoothstep(0, blurRadius, abs(i));
			count++;
		}
		sum /= count;
		
		gl_FragColor = mix(sum, texture2D(u_texture, v_texCoords), 1.0 - blurPower) * v_color;
	} else {
		gl_FragColor = texture2D(u_texture, v_texCoords) * v_color;
	}
}

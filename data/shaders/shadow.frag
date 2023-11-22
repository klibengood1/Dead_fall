uniform float time;
uniform vec2 res;
uniform sampler2D u_shadow;
uniform int shadows;// = 0;

void main() {
	vec4 col = texture2D(u_texture, v_texCoords) * v_color;
	
	if (shadows > 0) {
		vec2 shadowDir = vec2(-6.0, 8.0);
		// vec2 shadowDir = (vec2(0.5, 0.5) - v_texCoords) * (1.0 / res) * 24;
		vec4 shadowCol;
		float shadowSamples = length(shadowDir);
		shadowDir *= (1.0 / res);
		for (float i = 0.0; i < shadowSamples; i++) {
			vec2 dir = shadowDir * mix(0.0, 1.0, smoothstep(0, shadowSamples - 1, i));
			shadowCol += texture2D(u_shadow, v_texCoords + dir) / shadowSamples;
		}
		// col.rgb = mix(col.rgb, shadowCol.rgb * (1.0 - shadowCol.a), shadowCol.a);
		col.rgb = mix(col.rgb, col.rgb * shadowCol.rgb * 0.15, shadowCol.a);
	}
	
	gl_FragColor = col;
}

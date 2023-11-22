uniform sampler2D u_shadows;
uniform float ambientLight;
uniform float radius;
uniform vec2 res;
uniform vec2 dir;

void main() {
	vec2 texCoords = vec2(v_texCoords);
	// texCoords.x += (sin(v_worldPos.y * 0.12) + cos(v_worldPos.x * 0.06)) * 0.005;
	// texCoords.y += (sin(v_worldPos.x * 0.12) + cos(v_worldPos.y * 0.06)) * 0.005;
	vec4 worldColor = texture2D(u_texture, v_texCoords);
	
	/*vec4 shadowMapColor = vec4(0.0);
	
    vec2 tc = texCoords;

    // Number of pixels off the central pixel to sample from
    vec2 blur = radius / res;

    // Blur direction
    float hstep = dir.x;
    float vstep = dir.y;

    // Apply blur using 9 samples and predefined gaussian weights
    shadowMapColor += texture2D(u_shadows, vec2(tc.x - 4.0 * blur.x * hstep, tc.y - 4.0 * blur.y * vstep)) * 0.006;
    shadowMapColor += texture2D(u_shadows, vec2(tc.x - 3.0 * blur.x * hstep, tc.y - 3.0 * blur.y * vstep)) * 0.044;
    shadowMapColor += texture2D(u_shadows, vec2(tc.x - 2.0 * blur.x * hstep, tc.y - 2.0 * blur.y * vstep)) * 0.121;
    shadowMapColor += texture2D(u_shadows, vec2(tc.x - 1.0 * blur.x * hstep, tc.y - 1.0 * blur.y * vstep)) * 0.194;

    shadowMapColor += texture2D(u_shadows, vec2(tc.x, tc.y)) * 0.27;

    shadowMapColor += texture2D(u_shadows, vec2(tc.x + 1.0 * blur.x * hstep, tc.y + 1.0 * blur.y * vstep)) * 0.194;
    shadowMapColor += texture2D(u_shadows, vec2(tc.x + 2.0 * blur.x * hstep, tc.y + 2.0 * blur.y * vstep)) * 0.121;
    shadowMapColor += texture2D(u_shadows, vec2(tc.x + 3.0 * blur.x * hstep, tc.y + 3.0 * blur.y * vstep)) * 0.044;
    shadowMapColor += texture2D(u_shadows, vec2(tc.x + 4.0 * blur.x * hstep, tc.y + 4.0 * blur.y * vstep)) * 0.006;
	*/
	
	vec4 shadowMapColor = texture2D(u_shadows, texCoords);
	// vec3 finalColor = worldColor.rgb * shadowMapColor.rgb + mix(vec3(0, 0, 0), worldColor.rgb * shadowMapColor.rgb * 1.3, 1.0 - ambientLight);
	vec3 finalColor = worldColor.rgb * shadowMapColor.rgb + mix(vec3(0, 0, 0), worldColor.rgb * shadowMapColor.rgb * 0.1, 1.0 - ambientLight);
		
	gl_FragColor = vec4(finalColor, worldColor.a) * v_color;
	//gl_FragColor = vec4(finalColor, mix(worldColor.a, 0, shadowMapColor.a)) * v_color;
}

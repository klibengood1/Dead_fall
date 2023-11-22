uniform float time;
uniform vec2 res;
uniform sampler2D u_lightmap;
uniform sampler2D u_diffusion;
uniform sampler2D u_blackwhite;
uniform sampler2D u_noise;

void main() {
	vec2 sample;
	sample.x = sin(v_worldPos.y * 0.02 + time * 0.004) * 0.5 + 0.5;
	sample.y = cos(v_worldPos.x * 0.02 + time * 0.004) * 0.5 + 0.5;
	vec2 diffLength = vec2(16.0, 16.0) * texture2D(u_diffusion, v_texCoords).a;
	vec2 diffOffset = (texture2D(u_noise, sample).rg - 0.5) * 2 * (1.0 / res) * diffLength;
	
	vec2 texCoords = v_texCoords + diffOffset;
	//int amount = 128;
	//texCoords = round(texCoords * float(amount)) / float(amount);
	vec4 diffColor = texture2D(u_diffusion, texCoords);
	
	vec4 col = texture2D(u_texture, texCoords) * v_color;
	vec4 sceneColor = mix(col, col * diffColor + diffColor * diffColor.a * 0.5, diffColor.a);
	
	vec4 bwTex = texture2D(u_blackwhite, texCoords);
	sceneColor.rgb = mix(sceneColor.rgb, vec3(dot(sceneColor.rgb, vec3(0.33))) * bwTex.rgb, bwTex.a);

	vec4 light = texture2D(u_lightmap, texCoords);
	float brightness = max(light.r, max(light.g, light.b));
	sceneColor.rgb *= light.rgb;
	sceneColor.rgb = mix(vec3(dot(sceneColor.rgb, vec3(0.33, 0.33, 0.33))), sceneColor.rgb, 1 + brightness * 2.5);
	
	// sceneColor.rgb = mix(sceneColor.rgb, sceneColor.rgb * vec3(0.4, 0.6, 1.0), lightLevel * (1.0 - lightColor.a * 0.5)); // ночная гамма

	gl_FragColor = sceneColor;
}

// make this 120 for the mac:
#version 330 compatibility

uniform vec4    uSpecularColor;
uniform vec4    uColor;
uniform float   uNoiseAmp;
uniform float   uNoiseFreq;
uniform sampler3D Noise3;

// in variables from the vertex shader and interpolated in the rasterizer:

in  vec3  vN;		   // normal vector
in  vec3  vL;		   // vector from point to light
in  vec3  vE;		   // vector from point to eye
in  vec2  vST;		   // (s,t) texture coordinates

in  vec3  vMCposition;
in  vec3  vECposition;

vec3
RotateNormal(float angx, float angy, vec3 n)
{
	float cx = cos(angx);
	float sx = sin(angx);
	float cy = cos(angy);
	float sy = sin(angy);

	// rotate about x:
	float yp = n.y * cx - n.z * sx;    // y'
	n.z = n.y * sx + n.z * cx;    // z'
	n.y = yp;
	// n.x      =  n.x;

	// rotate about y:
	float xp = n.x * cy + n.z * sy;    // x'
	n.z = -n.x * sy + n.z * cy;    // z'
	n.x = xp;
	// n.y      =  n.y;

	return normalize(n);
}

void
main( )
{
	// lighting uniform variables -- these can be set once and left alone:
	float   uKa = 0.1f;
	float   uKd = 0.5f;
	float   uKs = 0.4f;		// coefficients of each type of lighting -- make sum to 1.0
	float   uShininess = 12.f;	 // specular exponent

	float s = vST.s;
	float t = vST.t;

	vec4 nvx = texture(Noise3, uNoiseFreq * vMCposition);
	float angx = nvx.r + nvx.g + nvx.b + nvx.a - 2.;	// -1. to +1.
	angx *= uNoiseAmp;

	vec4 nvy = texture(Noise3, uNoiseFreq * vec3(vMCposition.xy, vMCposition.z + 0.5));
	float angy = nvy.r + nvy.g + nvy.b + nvy.a - 2.;	// -1. to +1.
	angy *= uNoiseAmp;

	vec3 n = RotateNormal(angx, angy, vN);
	n = normalize(gl_NormalMatrix * n);

	vec3 Normal = normalize(n);
	vec3 Light  = normalize(vL);
	vec3 Eye    = normalize(vE);

	vec3 ambient = uKa * uColor.rgb;

	float dd = max( dot(Normal,Light), 0. );       // only do diffuse if the light can see the point
	vec3 diffuse = uKd * dd * uColor.rgb;

	float ss = 0.;
	if( dot(Normal,Light) > 0. )	      // only do specular if the light can see the point
	{
		vec3 ref = normalize(  reflect( -Light, Normal )  );
		ss = pow( max( dot(Eye,ref),0. ), uShininess );
	}

	vec3 specular = uKs * ss * uSpecularColor.rgb;
	gl_FragColor = vec4( ambient + diffuse + specular,  1. );
}


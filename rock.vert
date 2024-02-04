// make this 120 for the mac:
#version 330 compatibility

uniform float uA;
uniform float uB;
uniform float uC;
uniform float uD;
uniform float uLightX;
uniform float uLightY;
uniform float uLightZ;

uniform float Timer;

// out variables to be interpolated in the rasterizer and sent to each fragment shader:

out  vec3  vN;	  // normal vector
out  vec3  vL;	  // vector from point to light
out  vec3  vE;	  // vector from point to eye
out  vec2  vST;	  // (s,t) texture coordinates

out	vec3	 vMCposition;
out	vec3	 vECposition;

// where the light is:

const float PI = 3.14159265;
const float TWO_PI = 2. * PI;

void
main( )
{

	// Calculate normals
	float x = gl_Vertex.x;
	float y = gl_Vertex.y;
	float r = sqrt(pow(x, 2) + pow(y, 2));

	vec4 new_gl_Vertex = gl_Vertex;
	new_gl_Vertex.z = uA * cos(TWO_PI * uB * r + uC) * exp(-uD * r);

	vMCposition = new_gl_Vertex.xyz;
	vECposition = (gl_ModelViewMatrix * new_gl_Vertex).xyz;

	float drdx = x / r;
	float drdy = y / r;
	
	float dzdr = uA * (-sin(TWO_PI * uB * r + uC) * TWO_PI * uB * exp(-uD * r) + cos(TWO_PI * r + uC) * -uD * exp(-uD * r));

	float dzdx = dzdr * drdx;
	float dzdy = dzdr * drdy;

	vec3 Tx = vec3(1., 0., dzdx);
	vec3 Ty = vec3(0., 1., dzdy);

	vN = normalize(cross(Tx, Ty));

	vec3 LightPosition = vec3(uLightX, uLightY, uLightZ);

	vST = gl_MultiTexCoord0.st;
	vL = LightPosition - vECposition;	    // vector from the point to the light position
	vE = vec3( 0., 0., 0. ) - vECposition;       // vector from the point to the eye position
	gl_Position = gl_ModelViewProjectionMatrix * new_gl_Vertex;

}

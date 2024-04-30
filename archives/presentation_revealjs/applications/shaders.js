
"use strict"

//--------------------------------------------------------------------------------------------------------
// VERTEX SHADER (GLSL language)
//--------------------------------------------------------------------------------------------------------
var vertexShader = 
`#version 300 es

// INPUT
layout(location=1) in vec2 position_in;

// MAIN PROGRAM
void main()
{
	gl_Position = vec4( position_in, 0.0, 1.0 );
}
`;

//--------------------------------------------------------------------------------------------------------
// FRAGMENT SHADER (GLSL language)
//--------------------------------------------------------------------------------------------------------
var fragmentShader =
`#version 300 es
precision highp float;

// OUPUT
out vec4 oFragmentColor;

// UNIFORM
uniform vec2 uResolution;


// MAIN PROGRAM
// --- constantes --------------------------------------------------------
const float PI = 3.1415926535;

float NB = 256.;       // number or gabor blobs
float SIGMA = 0.0566;  // size of gabor blobs


// --- utilities ---------------------------------------------------------
float gauss(float x,float s) {
    return exp(-.5*(x*x)/(s*s)); 
}

float gauss(vec2 v,float s) { 
    return gauss(v.x,s)*gauss(v.y,s); 
}

float rndi(float i, float j) {
    return fract(1e5*sin(i+3.*j+0.567));
}


// --- Gabor noise = kernel * point distrib ------------------------------
float Gabor(vec2 pos, float F0, float omega) {
    float g = gauss(pos,SIGMA);
    float s = .5 * cos(2.*PI*F0*(pos.x*cos(omega)+pos.y*sin(omega)));
    
    return g*s; 
}

float GaborNoise(vec2 uv, float F0, float dir, float spread) {
    float f = 0.; 
    float fa = 0.;
    float omega = 0.;
    
	for (float i=0.; i<NB; i++) { 
		vec2 pos = vec2(1.8 * rndi(i, 0.), rndi(i, 1.));
        
        omega = dir + spread * PI * (2.*i/NB-1.);
		f += Gabor(uv-pos, F0, omega);
    }
	return f * sqrt(200./NB);
}


// -----------------------------------------------------------------------
void main()
{
    vec2 uv = ( gl_FragCoord.xy / uResolution.xy );

    // sortie
    oFragmentColor = vec4(0., uv.x, uv.y, 1.);
	
}
`;

//--------------------------------------------------------------------------------------------------------
// Global variables
//--------------------------------------------------------------------------------------------------------
var shaderProgram = null;
var vao = null;

var largeur;
var hauteur;

var frequence;
var spread;
var direction;

//--------------------------------------------------------------------------------------------------------
// Initialize graphics objects and GL states
//
// Here, we want to display a square/rectangle on screen
//--------------------------------------------------------------------------------------------------------
function init_wgl()
{
    ewgl.continuous_update = true;

    // UserInterface.begin();
    // UserInterface.use_field_set( 'H', "gabor" );
    // frequence  = UserInterface.add_slider( 'frequence', 0, 100, 19, update_wgl );
    // spread  = UserInterface.add_slider( 'orientation', 0, 100, 81, update_wgl );
    // direction  = UserInterface.add_slider( 'direction', 0, 100, 24, update_wgl );
    // UserInterface.end_use();

    // UserInterface.use_field_set( 'H', "carte de couleur" );
    // type  = UserInterface.add_list_input( ['carraux', 'cercle', 'angles', 'diagonales', 'bande tiers', 'bande quart', 'test'], 6, update_wgl );
    // parametre  = UserInterface.add_slider( 'parametre', 0, 100, 2, update_wgl );
    // UserInterface.end_use();
    // UserInterface.end();

    
    // Create and initialize a shader program // [=> Sylvain's API - wrapper of GL code]
    shaderProgram = ShaderProgram( vertexShader, fragmentShader, 'basic shader' );


    // Create ande initialize a vertex buffer object (VBO) [it is a buffer of generic user data: positions, normals, texture coordinates, temperature, etc...]
    // - create data on CPU
    // - this is the geometry of your object)
    // - we store 2D positions as 1D array : (x0,y0,x1,y1,x2,y2,x3,y3)
    let data_positions = new Float32Array(
        [ 1, 1, // (x0,y0) (haut droite)
         -1, 1, // (x1,y1) (haut gauche)
          1,-1, // (x2,y2) (bas droite)
         -1,-1] // (x3,y3) (bas gauche)
    );
    // - create a VBO (kind of memory pointer or handle on GPU)
    let vbo_positions = gl.createBuffer();
    // - bind "current" VBO
    gl.bindBuffer( gl.ARRAY_BUFFER, vbo_positions );
    // - allocate memory on GPU (size of data) and send data from CPU to GPU
    gl.bufferData( gl.ARRAY_BUFFER, data_positions, gl.STATIC_DRAW );
    // - reset GL state
    gl.bindBuffer( gl.ARRAY_BUFFER, null );

    // Create ande initialize a vertex array object (VAO) [it is a "container" of vertex buffer objects (VBO)]
    // - create a VAO (kind of memory pointer or handle on GPU)
    vao = gl.createVertexArray();
    // - bind "current" VAO
    gl.bindVertexArray( vao );
    // - bind "current" VBO
    gl.bindBuffer( gl.ARRAY_BUFFER, vbo_positions );
    // - attach VBO to VAO
    // - tell how data is stored in "current" VBO in terms of size and format.
    // - it specifies the "location" and data format of the array of generic vertex attributes at "index" ID to use when rendering
    let vertexAttributeID = 1; // specifies the "index" of the generic vertex attribute to be modified
    let dataSize = 2; // 2 for 2D positions. Specifies the number of components per generic vertex attribute. Must be 1, 2, 3, 4.
    let dataType = gl.FLOAT; // data type
    gl.vertexAttribPointer( vertexAttributeID, dataSize, dataType,
        false, 0, 0 ); // unused parameters for the moment (normalized, stride, pointer)
    // - enable the use of VBO. It enable or disable a generic vertex attribute array
    gl.enableVertexAttribArray( vertexAttributeID );

    // Reset GL states
    gl.bindVertexArray( null );
    gl.bindBuffer( gl.ARRAY_BUFFER, null ); // BEWARE: only unbind the VBO after unbinding the VAO !

    // Set default GL states
    // - color to use when refreshing screen
    gl.clearColor( 0, 0, 0 ,1 ); // black opaque [values are between 0.0 and 1.0]
    // - no depth buffer
    gl.disable( gl.DEPTH_TEST );


}

//--------------------------------------------------------------------------------------------------------
// Render scene
//--------------------------------------------------------------------------------------------------------
function draw_wgl()
{
    // --------------------------------
    // [1] - always do that
    // --------------------------------

    // Clear the GL color framebuffer
    gl.clear( gl.COLOR_BUFFER_BIT );

    // --------------------------------
    // [2] - render your scene
    // --------------------------------

    // Set "current" shader program
    shaderProgram.bind(); // [=> Sylvain's API - wrapper of GL code]

    // Bind "current" vertex array (VAO)
    gl.bindVertexArray( vao );

    //	Uniforms
    Uniforms.uResolution = [ window.innerWidth, window.innerHeight ];
    



    // Draw commands
    // - render 4 primitives of type "point"
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
    // - render 4 primitives of type "lines"
    // gl.drawArrays( gl.LINE_LOOP, 0, 4 );

    // Reset GL state(s)
    // - unbind vertex array
    gl.bindVertexArray( null );
    // - unbind shader program
    gl.useProgram( null );
}

//--------------------------------------------------------------------------------------------------------
// => Sylvain's API - call window creation with your customized "init_wgl()" and "draw_wgl()" functions
//--------------------------------------------------------------------------------------------------------
ewgl.launch_2d();

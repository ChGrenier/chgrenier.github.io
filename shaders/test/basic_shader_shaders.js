
"use strict"

//--------------------------------------------------------------------------------------------------------
// FRAGMENT SHADER (GLSL language)
//--------------------------------------------------------------------------------------------------------
var fragmentShader = 
`#version 300 es
precision highp float;

// INPUT
in vec2 texCoord;

// OUPUT
out vec4 oFragmentColor;

// UNIFORM 
uniform float iTime;


// MAIN PROGRAM
void main()
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = texCoord;

    // Time varying pixel color
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

    // Output to screen
    oFragmentColor = vec4(col,1.0);
}
`;










//--------------------------------------------------------------------------------------------------------
// VERTEX SHADER 
//--------------------------------------------------------------------------------------------------------
var vertexShader = 
`#version 300 es

// INPUT
layout(location=0) in vec2 position_in;
layout(location=1) in vec2 texCoord_in;


// OUTPUT
out vec2 texCoord;

// MAIN PROGRAM
void main()
{
	gl_Position = vec4( position_in, 0.0, 1.0 );
    texCoord = texCoord_in;
}
`;





//--------------------------------------------------------------------------------------------------------
// Global variables
//--------------------------------------------------------------------------------------------------------
var shaderProgram = null;
var object = null;


//--------------------------------------------------------------------------------------------------------
// Initialize graphics objects and GL states
//--------------------------------------------------------------------------------------------------------
function init_wgl()
{
    ewgl.continuous_update = true;

    UserInterface.begin(false, true);
    
    // UserInterface.use_field_set( 'H', "paramètres affichage" );
    // amplitude = UserInterface.add_slider( 'amplitude', 1, 24, 12, update_wgl );
    // UserInterface.end_use();
    
    UserInterface.end();
    
    // Create and initialize a shader program
    shaderProgram = ShaderProgram( vertexShader, fragmentShader, 'basic shader' );

    object = Mesh.Grid(2).renderer(0, -1, 1, -1); // grid : s = subdivision; renderer : id location = position, normals, texture_coords, colors
}

//--------------------------------------------------------------------------------------------------------
// Render scene
//--------------------------------------------------------------------------------------------------------
function draw_wgl()
{

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    shaderProgram.bind(); 


    //	Uniforms
    Uniforms.iTime = ewgl.current_time;


    // tracer
    object.draw(gl.TRIANGLES);
    

	unbind_shader();
}

//--------------------------------------------------------------------------------------------------------
// => Sylvain's API - call window creation with your customized "init_wgl()" and "draw_wgl()" functions
//--------------------------------------------------------------------------------------------------------
ewgl.launch_3d();

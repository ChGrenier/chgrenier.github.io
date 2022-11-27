
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
    vec2 uv = texCoord;

    // sortie
    oFragmentColor = vec4(0., uv.x*(0.5*cos(iTime)+0.5), uv.y*(0.5*sin(iTime)+0.5), 1.);
	
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


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
    vec2 uv = -1. + 2. * texCoord;
    
    vec2 z = uv * 1.5;
    vec2 c;// = vec2(-0.745, 0.19);
    float an = 0.1 * iTime + 10.;
    c.x = .5*cos(an) - .25*cos(2.*an);
    c.y = .5*sin(an) - .25*sin(2.*an);
    c *= 1.05;
    
    float t = 0.;
    
    for (int i=0; i<64; i++){
        vec2 nz = vec2(z.x*z.x - z.y*z.y, 2. * z.x*z.y) + c; 
        float m2 = dot(nz, nz);
        if(m2>4.) break;
        z = nz;
        t += 1./63.;
    }

    // Time varying pixel color
    vec3 col = vec3((0.5 * sin(1.2 * iTime + 2.4) + .5) * t, 
                    (0.5 * sin(iTime) + .5) * t, 
                     t);

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

    UserInterface.begin("Interface", true, true);
    
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


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


// les cartes de couleurs
//------------------------

#define _PI_ 3.14159265358979


vec3 color_map_fond(float intensite){
    float R, G, B;
    
    float inty = (intensite + _PI_)/(2.*_PI_);
    float it = inty-0.1;
    float it2 = inty-1.;
    
    if(inty<0.1){
        R = -2.0*it;
        G = -9.3*it;
        B = -18.0*it;
    }
    else if(inty>0.9){
        R = 0.13;
        G = 0.65;
        B = 0.80;
    }
    else{
        R = 0.20*it;
        G = 0.93*it;
        B = 1.80*it;
    }
    
    return vec3(R, G, B);
}


vec3 color_map_lune(float intensite){
    float R, G, B;
    
    float inty = (intensite + _PI_)/(2.*_PI_);
    float it = inty-0.1;
    float it2 = inty-1.;
    
    if(intensite<0.1){
        R = -1.*it + 0.5;
        G = -1.3*it + 0.75;
        B = -1.*it + 1.;
    }
    else if(intensite>0.9){
        R = 2.;
        G = 2.;
        B = 2.;
    }
    else{
        R = 0.5*it + 0.5;
        G = 1.23*it + 0.7;
        B = 2.1*it + 1.;
    }
    
    return vec3(R, G, B);
}


vec3 color_map_ville(float intensite){
    float R, G, B;
    
    float inty = (intensite + _PI_)/(2.*_PI_);
    float it = inty-0.1;
    float it2 = inty-1.;
    
    if(intensite<0.1){
        R = 0.00;
        G = 0.02;
        B = 0.07;
    }
    else if(intensite>0.9){
        R = 0.00;
        G = 0.05;
        B = 0.08;
    }
    else{
        R = -0.2;
        G = it*0.43 - 0.2;
        B = it*1.30 - 0.4;
    }
    
    return vec3(R, G, B);
}


vec3 color_map_poisson(float intensite){
    float R, G, B;
    
    float inty = (intensite + _PI_)/(2.*_PI_);
    float it = inty-0.1;
    float it2 = inty-1.;
    
    if(intensite<0.1){
        R = 0.00;
        G = 0.00;
        B = 0.25;
    }
    else if(intensite>0.9){
        R = 0.00;
        G = 0.15;
        B = 0.30;
    }
    else{
        R = it*0.00;
        G = it*0.43;
        B = it*1.30;
    }
    
    return vec3(R, G, B);
}


// ---- outils -----------------------------------------
float rndi(int i, int j)
{
	//vec2 uv = vec2(.5+float(i),.5+float(j))/ iChannelResolution[0].x;
	//return texture(iChannel0,uv).r;
    
    return fract(1e5*sin(float(i)+3.*float(j)+0.567));
}

float transfer_function(float N1, float N2){

    float R = sqrt(N1*N1 + N2*N2);
    
    float angle_rot = 0.4*sin(6.*R + iTime) + 0.1*sin(12.*R + 2.4*iTime);
    
    float n1 = N1*cos(angle_rot) - N2*sin(angle_rot);
    float n2 = N1*sin(angle_rot) + N2*cos(angle_rot);
    
    float Atan = atan(n1, n2);
    
    return Atan;
}

float phasor_ish(float x){
    float Ssin = sin(2.*x) + sin(4.*x + 0.7) + 0.5*sin(6.*x-1.);
    float Scos = cos(2.*x) + cos(4.*x + 0.7) + 0.5*cos(6.*x-1.);
    
    float phase = atan(Ssin/Scos);
    
    return phase;
}






// ---- Gabor -----------------------------------------
float gaussian(float x){
    float size = 0.24;
    return exp(-(x*x)/(size*size));
}

vec2 gabor(vec2 position, vec2 direction, float freq){
    float gauss = gaussian(position.x)*gaussian(position.y);
    
    vec2 var_temps = -vec2(0.075*iTime, 0.05*iTime);
    
    float sinus = 0.5*sin(2.*_PI_*freq*dot(position+var_temps, direction));
    float cosinus = 0.5*cos(2.*_PI_*freq*dot(position+var_temps, direction));
    
    return vec2(gauss*sinus, gauss*cosinus);
}

vec2 Gabor_noise(vec2 uv, int nb_kernel, float freq, float omega){
    vec2 noises= vec2(0., 0.);
    
    for (int i=0; i<nb_kernel; i++) {
    
		vec2 pos = vec2(1.5*rndi(i,0),rndi(i,1));
		vec2 dir = vec2(rndi(i,2),rndi(i,3)) + vec2(cos(omega), sin(omega));
        
        vec2 gabor_noise = gabor(uv-pos, dir, freq);
        
		noises += vec2(gabor_noise.x, gabor_noise.y);
	}
    
    return noises;
}






//----shapes-----------------------------------------
float circle(vec2 uv, float ampl, float origine, float perturbation){
    float forme = origine - ampl*sqrt(uv.x*uv.x + uv.y*uv.y);
    float shape = perturbation + forme;
    
    return smoothstep(0.02, 0.01, shape);
}

float moon_shape(vec2 uv, float perturbation){
    uv += vec2(-0.05, 0.2);
    
    float shape1 = circle(uv, 1.1, 0.2, perturbation);
    float shape2 = circle(uv-vec2(0.15, 0.), .9, 0.2, perturbation);
    
    float shape = shape1-shape2;
    
    return clamp(shape, 0., 1.);
}

float city_shape(vec2 uv, float perturbation){
    uv += perturbation;
    float x_value = 0.04*floor(2.*sin(5.*uv.x+5.5) + 
                               0.9*sin(24.*uv.x+0.24) + 
                               0.2*sin(124.*uv.x+2.));
    
    float value = smoothstep(0.1, 0.11, uv.y-x_value);
    return value;
}

float basilique_shape(vec2 uv, float perturbation){
    uv += perturbation;
    
    // tour
    float shape1 = smoothstep(-0.1, -0.05, 12.*abs(uv.x-0.24)-uv.y);
    shape1 += smoothstep(0.04, 0.045, abs(uv.x-0.24));
    shape1 = clamp(1.-shape1, 0., 1.);
    
    // batiement bas
    float shape2 = smoothstep(0.31, 0.32, 1.-uv.y);
    shape2 += smoothstep(-0.2, -0.19, 4.*uv.x-uv.y);
    shape2 = clamp(1.-shape2, 0., 1.);
    
    float shape = shape1+shape2;
    
    return shape;
}

float fish_shape(vec2 uv, vec2 pos, float direction, float size, float perturbation){
    //direction = 1. : regarde vers la gauche, -1. : regarde vers la droite
    
    uv *= size;
    
    uv.y += 0.05*cos(6.*uv.x-direction*5.*iTime);
    uv.x *= direction;
    
    uv += pos;
    uv += size*perturbation;

    //tete
    float rond = sqrt(dot(uv+vec2(0.13, 0.), uv+vec2(0.13, 0.)));
    rond = smoothstep(0.15, 0.155,rond);
    
    // corps
    float triangle = smoothstep(0.1, 0.11, abs(3.*uv.y)+uv.x-0.25);
    triangle += smoothstep(0.16, 0.15, uv.x+0.25);
    
    // nageoires
    vec2 ob_uv = vec2(uv.x-0.03, uv.x-1.5*uv.y);
    float paddle_d = sqrt(((ob_uv.x+0.01)*(ob_uv.x+0.01))/(2.*2.) + (ob_uv.y*ob_uv.y)/(1.*1.));
    paddle_d = smoothstep(0.07, 0.075,paddle_d);
    
    ob_uv = vec2(uv.x-0.03, uv.x+1.5*uv.y);
    float paddle_g = sqrt(((ob_uv.x+0.01)*(ob_uv.x+0.01))/(2.*2.) + (ob_uv.y*ob_uv.y)/(1.*1.));
    paddle_g = smoothstep(0.07, 0.075,paddle_g);
    
    float paddle = - (1.-paddle_g) - (1.-paddle_d);
    
    // queue
    float tail = smoothstep(0.1, 0.11, pow(3.*uv.y,2.)-uv.x+0.35);
    tail += smoothstep(0.103, 0.1, (0.004*cos(70.*uv.y)+pow(uv.y,2.))-0.4*uv.x+0.27);
    
    
    float shape = rond - (1.-triangle) + paddle - (1.-tail);
    shape = 1.-clamp(shape, 0., 1.);//1.-clamp(1., 0., shape);
    
    return shape;//clamp(0., 1., shape);
}




// =====================================================================================
void main()
{
    vec2 uv = texCoord;
    
    // ---- noises -----------------------------------------------------------
    float freq = mix(5., 10., 0.);
    float omega = _PI_/4.;
    int nb_kernel = 100;
    
    vec2 noises = Gabor_noise(uv, nb_kernel, freq, omega);
    
    float eau = transfer_function(noises.x, noises.y);
    float perturbation = 0.01*noises.x*noises.y;
    
    // ---- decor -------------------------------------------------------------
    float lune = moon_shape(uv-vec2(0.5), perturbation);
    
    float ville = city_shape(uv-0.7, perturbation);
    ville += basilique_shape(uv, perturbation);
    ville = clamp(ville, 0., 1.);
    
    
    // ---- poissons ----------------------------------------------------------
    float fish_1_pos_x = 2.*phasor_ish(0.06*iTime-2.7)-0.9;
    float fish_1_pos_y = -(0.6*sin(iTime*0.1+30.) + 0.5);
    vec2 fish_1_pos = vec2(fish_1_pos_x, fish_1_pos_y);
    
    float fish_1 = fish_shape(uv, fish_1_pos, 1., 2., perturbation);
    
    
    
    float fish_2_pos_x = 2.*phasor_ish(-0.1*iTime-3.5)-0.9;
    float fish_2_pos_y = -(0.5*cos(iTime*0.1+24.) + 0.5);
    vec2 fish_2_pos = vec2(-fish_2_pos_x, fish_2_pos_y);
    
    float fish_2 = fish_shape(uv, fish_2_pos, -1., 2., perturbation);
    
    
    
    // ---- rendu -------------------------------------------------------------
    vec3 col_eau = (1.-(ville + lune + fish_1 + fish_2)) * color_map_fond(eau);
    
    vec3 col_reflet_lune = lune * color_map_lune(eau);
    vec3 col_reflet_ville = ville * color_map_ville(eau);
    vec3 col_reflet_fish = fish_1 * color_map_poisson(eau) + fish_2 * color_map_poisson(eau);
    
    vec3 col = col_eau + col_reflet_lune + col_reflet_ville + col_reflet_fish;

    float test = fish_2;

    // ---- Output to screen --------------------------------------------------
    oFragmentColor = vec4(col, 1.);
    //oFragmentColor = vec4(vec3(test), 1.);
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

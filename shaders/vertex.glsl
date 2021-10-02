 varying vec2 vertexUV; // UV passed into fragment shader

 void main() {
     //set it as vertex shader runs
     vertexUV = uv;
     gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
 }

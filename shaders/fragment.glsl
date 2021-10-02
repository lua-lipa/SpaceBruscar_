uniform sampler2D globeTexture;

varying vec2 vertexUV; // vec2[0, 0.3]

void main() { 
    /*
        Second param: UV Coordinates 
        UV are X and Y coordinate for something 2D
        Map 2D texture on 3D space
            Fragment shader, we set UV in here
            https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
    */
    texture2D(globeTexture, vertexUV);
    gl_FragColor = texture2D(globeTexture, vertexUV);
}
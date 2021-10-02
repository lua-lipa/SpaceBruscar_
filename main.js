import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as satellite from 'satellite.js';

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

const scene = new THREE.Scene()
const camera = new THREE.
PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.1,
    1000
)

const renderer = new THREE.WebGLRenderer({
    antialias: true
})
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement);

const radius = 10
const radiusKm = 6371

const texture = new THREE.TextureLoader().load('../img/earth.jpg');
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 50, 50),
    new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            globeTexture: {
                value: texture
            }
        }
    })
)

scene.add(sphere)
camera.position.z = 20

function calcPosFromLatLonRad(lat, lon, height) {
    var phi = (90 - lat) * (Math.PI / 180)
    var theta = (lon + 180) * (Math.PI / 180)
    height = radius + ((radius / radiusKm) * height)

    //(10/6371) * height
    let x = -(height) * (Math.sin(phi) * Math.cos(theta))
    let z = (height) * (Math.sin(phi) * Math.sin(theta))
    let y = (height) * (Math.cos(phi))

    // var x = -(radius + heigth) * Math.cos(phi) * Math.cos(theta);
    // var y = (radius + heigth) * Math.sin(phi);
    // var z = (radius + heigth) * Math.cos(phi) * Math.sin(theta);

    return { x, y, z }
}

//red markers
let mesh = new THREE.Mesh(
    new THREE.SphereBufferGeometry(6371 / 50, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
)

// let point1 = {
//     lat: 50.4501,
//     lng: 30.5234
// }

// let mexico = {
//     lat: 32.1656,
//     lng: -82.9001
// }

// //let pos = convertLatLngToCartesian(point1)
// let pos = calcPosFromLatLonRad(mexico.lat, mexico.lng)

const loader = new THREE.FileLoader();

//load a text file and output the result to the console
var tle = []
var satrecs = []
loader.load(
    // resource URL
    'starlink.tle',

    // onLoad callback
    function(data) {
        // output the text to the console
        //console.log(data)
        var lines = data.split('\n')
        console.log(lines)
        var count = 0
        var lineCount = 0
        lines.forEach(line => {

            if (line[0] == "1") {
                tle[count] = {}
                tle[count][0] = line
            } else if (line[0] == "2") {
                try {
                    tle[count][1] = line


                    const satrec = satellite.twoline2satrec(
                        tle[count][0], tle[count][1]
                    )

                    const date = new Date()
                    const positionAndVelocity = satellite.propagate(satrec, date)
                    const gmst = satellite.gstime(date)
                    const tlePos = satellite.eciToGeodetic(positionAndVelocity.position, gmst)

                    let mesh = new THREE.Mesh(
                        new THREE.SphereBufferGeometry(0.05, 10, 10),
                        new THREE.MeshBasicMaterial({ color: 0xff0000 })
                    )

                    var longitudeDeg = satellite.degreesLong(tlePos.longitude),
                        latitudeDeg = satellite.degreesLat(tlePos.latitude);

                    satrecs.push({
                        "satrec": satrec,
                        "mesh": mesh
                    })


                    let pos = calcPosFromLatLonRad(latitudeDeg, longitudeDeg, tlePos.height)

                    mesh.position.set(pos.x, pos.y, pos.z)

                    scene.add(mesh)

                    count++
                } catch (error) {
                    console.log(error)
                }


            }
            lineCount++
            console.log(lineCount)
        })
    },

    // onProgress callback
    function(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },

    // onError callback
    function(err) {
        console.error('An error happened');
    }
);

function updateSatRecs() {
    for (var i = 0; i < satrecs.length; i++) {
        let satrec = satrecs[i]["satrec"];
        let mesh = satrecs[i]["mesh"]

        const date = new Date()
        const positionAndVelocity = satellite.propagate(satrec, date)
        const gmst = satellite.gstime(date)
        const tlePos = satellite.eciToGeodetic(positionAndVelocity.position, gmst)

        var longitudeDeg = satellite.degreesLong(tlePos.longitude),
            latitudeDeg = satellite.degreesLat(tlePos.latitude);
        let pos = calcPosFromLatLonRad(latitudeDeg, longitudeDeg, tlePos.height)
        mesh.position.set(pos.x, pos.y, pos.z)
    }
}


// mesh.position.set(pos.x, pos.y, pos.z)

//mesh.position.set(1, 0, 0)

// scene.add(mesh)

function animate() {
    controls.update()
    updateSatRecs()
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
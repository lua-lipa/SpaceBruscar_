import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

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

const texture = new THREE.TextureLoader().load('../img/earth.jpg');

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 30, 30),
    new THREE.MeshBasicMaterial({
        map: texture
    })
)

scene.add(sphere)
camera.position.z = 3

function calcPosFromLatLonRad(lat, lon) {
    var phi = (90 - lat) * (Math.PI / 180)
    var theta = (lon + 180) * (Math.PI / 180)

    let x = -(Math.sin(phi) * Math.cos(theta))
    let z = (Math.sin(phi) * Math.sin(theta))
    let y = (Math.cos(phi + 50))

    return { x, y, z }
}

//red markers
let mesh = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.01, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
)

let point1 = {
    lat: 50.4501,
    lng: 30.5234
}

let mexico = {
    lat: 32.1656,
    lng: -82.9001
}

//let pos = convertLatLngToCartesian(point1)
let pos = calcPosFromLatLonRad(mexico.lat, mexico.lng)

console.log(pos.x)
mesh.position.set(pos.x, pos.y, pos.z)

//mesh.position.set(1, 0, 0)

scene.add(mesh)

function animate() {
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
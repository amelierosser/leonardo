import {
	GL,
	Renderer,
	Scene,
	PerspectiveCamera,
	AxisHelper,
	GridHelper,
	OrbitControls,
	SphereGeometry,
	Shader,
	Mesh,
	Color,
	Texture,
	TextureCube,
} from 'index';
import gui, {
	guiController
} from '../gui';
import { hookVertexPre, hookVertexEnd } from './Vertex.glsl';
import fragmentShader from './Frag.glsl';

// Renderer
const renderer = new Renderer({
	ratio: window.innerWidth / window.innerHeight,
	prefferedContext: guiController.context,
});
renderer.setDevicePixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.canvas);

// Scene
const scene = new Scene();

// Camera
const camera = new PerspectiveCamera({
	fov: 45,
});

camera.position.set(10, 5, 10);
camera.lookAt();

// Helpers
const controls = new OrbitControls(camera, renderer.canvas);
const grid = new GridHelper(10);
scene.add(grid);
const axis = new AxisHelper(1);
scene.add(axis);
controls.update();

const environmentMap = new TextureCube({
	src: [
		'/assets/textures/cube/pisa-hdr/px.hdr',
		'/assets/textures/cube/pisa-hdr/nx.hdr',
		'/assets/textures/cube/pisa-hdr/py.hdr',
		'/assets/textures/cube/pisa-hdr/ny.hdr',
		'/assets/textures/cube/pisa-hdr/pz.hdr',
		'/assets/textures/cube/pisa-hdr/nz.hdr',
	],
});

function skybox() {
	const material = new Shader({
		hookVertexPre: GL.webgl2 ?
		'out vec3 vTexturePosition;' :
		'varying vec3 vTexturePosition;',
		hookVertexEnd: `
			vTexturePosition = (uModelMatrix * vec4(aVertexPosition, 1.0)).xyz;
		`,
		hookFragmentPre: GL.webgl2 ? `
			uniform samplerCube uEnvironment;
			in vec3 vTexturePosition;

			const float A = 0.15;
			const float B = 0.50;
			const float C = 0.10;
			const float D = 0.20;
			const float E = 0.02;
			const float F = 0.30;

			vec3 Uncharted2Tonemap( vec3 x )
			{
				return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
			}

		` : `
			uniform samplerCube uEnvironment;
			varying vec3 vTexturePosition;
		`,
		hookFragmentMain: GL.webgl2 ?
		`
		float uExposure = 1.0;
		float uGamma = 1.0;
		color = texture(uEnvironment, vTexturePosition).rgb;
		color				= Uncharted2Tonemap( color * uExposure );
		// white balance
		color				= color * ( 1.0 / Uncharted2Tonemap( vec3( 20.0 ) ) );

		// gamma correction
		color				= pow( color, vec3( 1.0 / uGamma ) );
		` :
		'color = textureCube(uEnvironment, vTexturePosition).rgb;',
		uniforms: {
			uEnvironment: {
				type: 'tc',
				value: environmentMap.texture,
				textureIndex: 0,
			},
		},
	});

	const geometry = new SphereGeometry(10, 64, 64);
	const mesh = new Mesh(geometry, material);

	scene.add(mesh);
}
skybox();

function sphere() {
	const material = new Shader({
		hookVertexPre,
		hookVertexEnd,
		fragmentShader,
		uniforms: {
			tex: {
				type: 'tc',
				value: environmentMap.texture,
				textureIndex: 0,
			},
		},
	});

	const geometry = new SphereGeometry(2, 64, 64);
	const mesh = new Mesh(geometry, material);

	scene.add(mesh);
}
sphere();

// const baseColor = new Color();
// gui.addColor(guiController, 'color').onChange(val => {
// 	const rgb = baseColor.hexStringToRgb(val);
// 	mesh.shader.uniforms.albedo.value[0] = rgb / 255;
// 	mesh.shader.uniforms.albedo.value[1] = rgb / 255;
// 	mesh.shader.uniforms.albedo.value[2] = rgb / 255;
// });

function resize() {
	const width = window.innerWidth;
	const height = window.innerHeight;
	renderer.setSize(width, height);
}
resize();

window.addEventListener('resize', resize);

function update() {
	requestAnimationFrame(update);
	renderer.render(scene, camera);
}
update();

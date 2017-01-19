import {
	Renderer,
	Scene,
	PerspectiveCamera,
	AxisHelper,
	GridHelper,
	OrbitControls,
	SphereGeometry,
	Shader,
	Mesh,
	PointLight,
	Color,
	DirectionalLight,
	Object3D,
	BoxGeometry,
	Constants,
} from 'index';
import dat from 'dat-gui';

const gui = new dat.GUI();
gui.open();

// Renderer
const renderer = new Renderer({
	ratio: window.innerWidth / window.innerHeight,
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

const intensity = 0.7;

const directionalLight = new DirectionalLight();
const pointLight0 = new PointLight({
	intensity: {
		type: 'f',
		value: intensity,
	},
});
const pointLight1 = new PointLight({
	intensity: {
		type: 'f',
		value: intensity,
	},
});
const pointLight2 = new PointLight({
	intensity: {
		type: 'f',
		value: intensity,
	},
});
scene.add(directionalLight);
scene.add(pointLight0);
scene.add(pointLight1);
scene.add(pointLight2);

directionalLight.position.set(1, 1, 1);
pointLight0.position.set(0, 0, 30);

const lights = [
	pointLight0,
	pointLight1,
	pointLight2,
];

const container = new Object3D();

const material = new Shader({
	pointLights: [pointLight0.uniforms, pointLight1.uniforms, pointLight2.uniforms],
	uniforms: {
		uDiffuse: {
			type: '3f',
			value: new Color(0x000000).v,
		},
	},
});

const material2 = new Shader({
	drawType: Constants.DRAW_LINES,
	uniforms: {
		uDiffuse: {
			type: '3f',
			value: new Color(0xFF0000).v,
		},
	},
});

const geometry0 = new BoxGeometry(2, 2, 2);
const mesh0 = new Mesh(geometry0, material);
mesh0.setParent(container);

container.xx = true;

const geometry1 = new SphereGeometry(2, 32, 32);
const mesh1 = new Mesh(geometry1, material2);
mesh1.isSphere = true;
mesh1.setParent(mesh0);

mesh0.position.x = -10;
mesh1.position.x = 10;

scene.add(mesh0);
scene.add(mesh1);

gui.add(mesh0.position, 'x', -10, 10);
gui.add(mesh0.position, 'y', -10, 10);
gui.add(mesh0.position, 'z', -10, 10);
gui.add(mesh1.position, 'x', -10, 10);

function resize() {
	const width = window.innerWidth;
	const height = window.innerHeight;
	renderer.setSize(width, height);
}
resize();

window.addEventListener('resize', resize);

function update(time) {
	requestAnimationFrame(update);

	const radius = 20;
	const t = time * 0.0005;

	container.rotation.x += 0.01;
	container.rotation.y += 0.01;
	container.rotation.z += 0.01;
	mesh0.rotation.x += 0.02;
	mesh0.rotation.y -= 0.02;
	mesh0.rotation.z += 0.02;

	// Container doesn't get drawn so updateMatrix() needs
	// to be called manually
	container.updateMatrix();

	lights.forEach((light, i) => {
		const theta = (i / lights.length) * Math.PI * 2;
		const x = Math.cos(t + theta) * radius;
		const y = Math.cos(t + theta) * radius;
		const z = Math.sin(t + theta) * radius;
		light.position.set(x, y, z);
	});

	renderer.render(scene, camera);
}
update();
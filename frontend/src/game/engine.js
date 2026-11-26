import * as THREE from "three";
import { createCharacter } from "./characters";
import { buildScenery } from "./scenery";
import { bridgeHeight, canWalk, findPath, FRIENDS, HOUSES, SPAWN } from "./world";

export function createGarden(host, { labels, onState, onTalk, onError }) {
  const mobile = matchMedia("(pointer: coarse)").matches || host.clientWidth < 600;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  } catch {
    onError("O cenário 3D não abriu neste navegador. Você pode continuar pela lista de encontros.");
    return null;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.35 : 1.7));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute(
    "aria-label",
    "Jardim 3D. Use WASD ou setas para caminhar, Shift para correr e E para conversar. Arraste para olhar ao redor.",
  );
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#c5e4ec");
  scene.fog = new THREE.FogExp2("#cbdedc", 0.014);
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 220);
  const hemi = new THREE.HemisphereLight("#d7edff", "#bd9b7a", 1.66);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight("#fff1d5", 2.25);
  sun.position.set(-19, 32, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  Object.assign(sun.shadow.camera, {
    left: -38,
    right: 38,
    top: 38,
    bottom: -38,
    near: 1,
    far: 100,
  });
  sun.shadow.normalBias = 0.024;
  sun.shadow.radius = 3;
  sun.shadow.bias = -0.00012;
  scene.add(sun);
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(180, 24, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        top: { value: new THREE.Color("#7ec2e8") },
        bottom: { value: new THREE.Color("#e0e9de") },
      },
      vertexShader:
        "varying vec3 vWorld; void main(){vWorld=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
      fragmentShader: `
        uniform vec3 top;
        uniform vec3 bottom;
        varying vec3 vWorld;
        void main() {
          float height = clamp(normalize(vWorld).y, 0.0, 1.0);
          gl_FragColor = vec4(mix(bottom, top, smoothstep(0.0, 0.61, height)), 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    }),
  );
  scene.add(sky);
  const scenery = buildScenery(scene, mobile);
  const trail = new THREE.InstancedMesh(
    new THREE.RingGeometry(0.06, 0.1, 12).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      color: "#ffe4a0",
      transparent: true,
      opacity: 0.83,
      depthWrite: false,
    }),
    14,
  );
  trail.count = 0;
  trail.frustumCulled = false;
  scene.add(trail);
  const stepMark = new THREE.Object3D();
  const player = createCharacter({ player: true });
  scene.add(player);
  const friends = FRIENDS.map((friend) => {
    const model = createCharacter(friend);
    model.position.set(friend.x, 0, friend.z);
    model.rotation.y = 0.4;
    scene.add(model);
    return { ...friend, model };
  });
  const storageKey = `moranguinho-world-v1:${localStorage.getItem("tutti-frutti-guest-id") || "local"}`;
  const defaultPitch = 0.25;
  let yaw = 0,
    pitch = defaultPitch,
    paused = false,
    destroyed = false,
    path = [],
    following = null,
    targetId = 1,
    lastState = -1,
    lastSaved = -1,
    elapsed = 0,
    movingSpeed = 0,
    lastTime = 0,
    frame = 0;
  let activities = [],
    nearId = null;
  const keys = new Set(),
    joystick = { x: 0, y: 0 },
    desired = new THREE.Vector3(),
    lookAt = new THREE.Vector3(),
    marker = new THREE.Vector3();
  function resetPosition() {
    player.position.set(SPAWN.x, 0, SPAWN.z);
    player.rotation.y = Math.PI;
    yaw = mobile ? 0.19 : 0.44;
    pitch = defaultPitch;
    path = [];
    following = null;
  }
  resetPosition();
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (
      saved &&
      Number.isFinite(saved.x) &&
      Number.isFinite(saved.z) &&
      canWalk(saved.x, saved.z, scenery.obstacles)
    ) {
      player.position.set(saved.x, 0, saved.z);
      yaw = Number.isFinite(saved.yaw) ? saved.yaw : 0;
    }
  } catch {
    /* A damaged local save should never prevent entering the garden. */
  }
  function savePosition() {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ x: player.position.x, z: player.position.z, yaw }),
      );
    } catch {
      /* Gameplay remains available when storage is disabled. */
    }
  }
  function status(force = false) {
    if (!force && elapsed - lastState < 0.1) return;
    lastState = elapsed;
    const nearest = friends.reduce((best, friend) => {
      const distance = Math.hypot(friend.x - player.position.x, friend.z - player.position.z);
      return !best || distance < best.distance ? { friend, distance } : best;
    }, null);
    nearId = nearest.distance < 2.7 ? nearest.friend.id : null;
    const target = friends.find((friend) => friend.id === targetId) || friends[5];
    const distance = Math.hypot(target.x - player.position.x, target.z - player.position.z);
    const angle =
      Math.atan2(target.x - player.position.x, target.z - player.position.z) - yaw + Math.PI;
    const region =
      nearest.distance < 11
        ? nearest.friend.region
        : player.position.x > 7 && player.position.x < 13
          ? "Riacho das flores"
          : "Caminhos do jardim";
    onState({
      nearId,
      distance: Math.round(distance),
      angle,
      following: Boolean(following),
      region,
      moving: movingSpeed > 0.1,
      x: player.position.x,
      z: player.position.z,
    });
  }
  function interact() {
    status(true);
    if (paused || !nearId) return;
    path = [];
    following = null;
    keys.clear();
    joystick.x = joystick.y = 0;
    const friend = friends.find((item) => item.id === nearId);
    player.rotation.y = Math.atan2(friend.x - player.position.x, friend.z - player.position.z);
    onTalk(nearId);
  }
  function follow(id) {
    if (paused) return;
    const friend = friends.find((item) => item.id === id);
    if (!friend) return;
    if (Math.hypot(friend.x - player.position.x, friend.z - player.position.z) < 2.6) {
      status(true);
      interact();
      return;
    }
    const route = findPath(player.position, friend, scenery.obstacles);
    if (!route.length) {
      onError(
        "Esse caminho está bloqueado. Caminhe um pouco para o lado e tente seguir a amiga novamente.",
      );
      return;
    }
    path = route;
    following = id;
    status(true);
  }
  const keydown = (event) => {
    if (
      paused ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) ||
      event.target.closest("dialog")
    )
      return;
    const key = event.key.toLowerCase();
    if (
      [
        "w",
        "a",
        "s",
        "d",
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
        "shift",
        "e",
      ].includes(key)
    ) {
      if (event.target.closest("button") && !["w", "a", "s", "d", "e"].includes(key)) return;
      event.preventDefault();
      if (key === "e" && !event.repeat) interact();
      else {
        keys.add(key);
        if (key !== "shift") {
          path = [];
          following = null;
        }
      }
    }
  };
  const keyup = (event) => keys.delete(event.key.toLowerCase());
  const blur = () => {
    keys.clear();
    joystick.x = joystick.y = 0;
    path = [];
    following = null;
  };
  window.addEventListener("keydown", keydown);
  window.addEventListener("keyup", keyup);
  window.addEventListener("blur", blur);
  const visibility = () => {
    if (document.hidden) {
      blur();
      savePosition();
    }
  };
  document.addEventListener("visibilitychange", visibility);
  let pointer = null;
  const pointerdown = (event) => {
    if (paused) return;
    renderer.domElement.focus({ preventScroll: true });
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    renderer.domElement.setPointerCapture(event.pointerId);
  };
  const pointermove = (event) => {
    if (!pointer || paused || event.pointerId !== pointer.id) return;
    yaw -= (event.clientX - pointer.x) * 0.006;
    pitch = THREE.MathUtils.clamp(pitch + (event.clientY - pointer.y) * 0.003, 0.2, 0.85);
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  };
  const pointerup = (event) => {
    pointer = null;
    if (renderer.domElement.hasPointerCapture(event.pointerId))
      renderer.domElement.releasePointerCapture(event.pointerId);
  };
  renderer.domElement.addEventListener("pointerdown", pointerdown);
  renderer.domElement.addEventListener("pointermove", pointermove);
  renderer.domElement.addEventListener("pointerup", pointerup);
  renderer.domElement.addEventListener("pointercancel", pointerup);
  const contextLost = (event) => {
    event.preventDefault();
    onError(
      "O navegador interrompeu os gráficos 3D. Recarregue o cenário para continuar; sua jornada está salva.",
    );
  };
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  const resize = () => {
    const w = host.clientWidth,
      h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  const ray = new THREE.Ray(),
    hit = new THREE.Vector3();
  const houseBounds = HOUSES.map(
    (house) =>
      new THREE.Box3(
        new THREE.Vector3(house.x - house.w / 2 - 0.3, 0, house.z - house.d / 2 - 0.3),
        new THREE.Vector3(house.x + house.w / 2 + 0.3, 6, house.z + house.d / 2 + 0.3),
      ),
  );
  function positionCamera(dt, snap = false) {
    lookAt.set(player.position.x, 1.38 + player.position.y, player.position.z);
    const distance = mobile ? 6.6 : 8.35;
    desired.set(
      player.position.x + Math.sin(yaw) * Math.cos(pitch) * distance,
      1.2 + player.position.y + Math.sin(pitch) * distance,
      player.position.z + Math.cos(yaw) * Math.cos(pitch) * distance,
    );
    ray.origin.copy(lookAt);
    ray.direction.copy(desired).sub(lookAt).normalize();
    for (const bounds of houseBounds)
      if (ray.intersectBox(bounds, hit) && hit.distanceTo(lookAt) < desired.distanceTo(lookAt))
        desired.copy(hit).addScaledVector(ray.direction, -0.3);
    camera.position.lerp(desired, snap ? 1 : 1 - Math.exp(-8 * dt));
    camera.lookAt(lookAt);
  }
  positionCamera(1, true);
  function loop(now) {
    if (destroyed) return;
    frame = requestAnimationFrame(loop);
    const dt = Math.min((now - (lastTime || now)) / 1000, 0.05);
    lastTime = now;
    if (document.hidden) return;
    elapsed += dt;
    let dx = 0,
      dz = 0;
    if (!paused) {
      const forward =
        Number(keys.has("w") || keys.has("arrowup")) -
        Number(keys.has("s") || keys.has("arrowdown")) -
        joystick.y;
      const side =
        Number(keys.has("d") || keys.has("arrowright")) -
        Number(keys.has("a") || keys.has("arrowleft")) +
        joystick.x;
      if (Math.abs(forward) + Math.abs(side) > 0.01) {
        dx = Math.cos(yaw) * side - Math.sin(yaw) * forward;
        dz = -Math.sin(yaw) * side - Math.cos(yaw) * forward;
      } else if (path.length) {
        const target = path[0],
          distance = Math.hypot(target.x - player.position.x, target.z - player.position.z);
        if (distance < 0.2) path.shift();
        else {
          dx = (target.x - player.position.x) / distance;
          dz = (target.z - player.position.z) / distance;
        }
        if (following) {
          const friend = friends.find((f) => f.id === following);
          if (Math.hypot(friend.x - player.position.x, friend.z - player.position.z) < 2.35) {
            path = [];
            following = null;
            status(true);
            interact();
            dx = dz = 0;
          }
        }
      }
      const length = Math.hypot(dx, dz),
        speed = keys.has("shift") || following ? 5 : 3.2;
      if (length > 0) {
        dx /= Math.max(1, length);
        dz /= Math.max(1, length);
      }
      const x = player.position.x + dx * speed * dt,
        z = player.position.z + dz * speed * dt;
      const oldX = player.position.x,
        oldZ = player.position.z;
      if (canWalk(x, player.position.z, scenery.obstacles)) player.position.x = x;
      if (canWalk(player.position.x, z, scenery.obstacles)) player.position.z = z;
      movingSpeed =
        Math.hypot(player.position.x - oldX, player.position.z - oldZ) / Math.max(dt, 0.001);
      if (length > 0.01) {
        const angle = Math.atan2(dx, dz),
          delta = Math.atan2(
            Math.sin(angle - player.rotation.y),
            Math.cos(angle - player.rotation.y),
          );
        player.rotation.y += delta * (1 - Math.exp(-14 * dt));
      }
      player.position.y = THREE.MathUtils.lerp(
        player.position.y,
        bridgeHeight(player.position.x, player.position.z),
        Math.min(1, dt * 10),
      );
      if (elapsed - lastSaved > 2) {
        savePosition();
        lastSaved = elapsed;
      }
    } else movingSpeed = 0;
    player.userData.animate(elapsed, movingSpeed);
    friends.forEach((friend) => {
      const distance = Math.hypot(friend.x - player.position.x, friend.z - player.position.z);
      friend.model.userData.animate(elapsed + friend.id, 0, distance < 5 && !paused);
      if (distance < 8)
        friend.model.rotation.y = Math.atan2(
          player.position.x - friend.x,
          player.position.z - friend.z,
        );
    });
    scenery.animate(elapsed);
    trail.count = !paused && following ? Math.min(14, path.length) : 0;
    for (let i = 0; i < trail.count; i++) {
      const { x, z } = path[i];
      stepMark.position.set(x, bridgeHeight(x, z) + 0.025, z);
      stepMark.scale.setScalar(0.88 + Math.sin(elapsed * 5 - i * 0.47) * 0.15);
      stepMark.updateMatrix();
      trail.setMatrixAt(i, stepMark.matrix);
    }
    if (trail.count) trail.instanceMatrix.needsUpdate = true;
    positionCamera(dt);
    renderer.render(scene, camera);
    for (const friend of friends) {
      const label = labels.get(friend.id);
      if (!label) continue;
      marker.set(friend.x, friend.model.userData.markerHeight, friend.z).project(camera);
      const distance = friend.model.position.distanceTo(player.position);
      const visible =
        marker.z < 1 &&
        marker.z > -1 &&
        Math.abs(marker.x) < 1.1 &&
        Math.abs(marker.y) < 1.1 &&
        distance < (friend.id === targetId ? 24 : 6);
      label.style.visibility = visible && !paused ? "visible" : "hidden";
      label.style.transform = `translate(${((marker.x + 1) / 2) * host.clientWidth}px,${((-marker.y + 1) / 2) * host.clientHeight}px) translate(-50%,-100%)`;
      label.dataset.status = activities.find((a) => a.id === friend.id)?.status || "locked";
    }
    host.dataset.playerX = player.position.x.toFixed(2);
    host.dataset.playerZ = player.position.z.toFixed(2);
    status();
  }
  frame = requestAnimationFrame(loop);
  return {
    follow,
    interact,
    stop() {
      path = [];
      following = null;
      status(true);
    },
    setActivities(next) {
      activities = next;
      targetId = next.find((a) => a.status === "available")?.id || 6;
      scenery.setFestival(
        next.length > 0 && next.every((activity) => activity.status === "completed"),
      );
      status(true);
    },
    setPaused(value) {
      paused = value;
      keys.clear();
      joystick.x = joystick.y = 0;
      pointer = null;
      if (paused) savePosition();
    },
    setJoystick(x, y) {
      if (paused) return;
      joystick.x = x;
      joystick.y = y;
      if (Math.abs(x) + Math.abs(y) > 0.01) {
        path = [];
        following = null;
      }
    },
    reset() {
      resetPosition();
      savePosition();
      positionCamera(1, true);
      status(true);
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frame);
      savePosition();
      observer.disconnect();
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      const geometries = new Set(),
        materials = new Set(),
        textures = new Set(scenery.textures);
      scene.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material)
          (Array.isArray(object.material) ? object.material : [object.material]).forEach((m) => {
            materials.add(m);
            Object.values(m).forEach((value) => {
              if (value?.isTexture) textures.add(value);
            });
          });
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}

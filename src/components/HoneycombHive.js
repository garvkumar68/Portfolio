import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Three.js honeycomb hive — renders projects as 3D hexagonal tiles
 * arranged in a true honeycomb lattice with depth, parallax tilt, and per-tile
 * hover/click interaction. Each tile uses the project image as a texture on
 * an extruded hexagon prism.
 */
export function HoneycombHive({ projects, onSelect }) {
  const mountRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    // Soft glowing green-blue key light to match the portfolio theme
    const key = new THREE.DirectionalLight(0x00dfa2, 1.1);
    key.position.set(3, 4, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x6ad0ff, 0.6);
    rim.position.set(-4, -2, 3);
    scene.add(rim);

    // Hexagonal prism geometry (flat-top hex extruded)
    const hexRadius = 0.55;
    const hexShape = new THREE.Shape();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i + Math.PI / 6; // pointy-top
      const x = Math.cos(a) * hexRadius;
      const y = Math.sin(a) * hexRadius;
      if (i === 0) hexShape.moveTo(x, y);
      else hexShape.lineTo(x, y);
    }
    hexShape.closePath();
    const geom = new THREE.ExtrudeGeometry(hexShape, {
      depth: 0.18,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 3,
    });
    geom.center();

    // Layout: pointy-top honeycomb lattice, 2 columns, N rows
    const cols = 2;
    const dx = hexRadius * Math.sqrt(3); // horizontal spacing for pointy-top
    const dy = hexRadius * 1.5; // vertical spacing
    const rows = Math.ceil(projects.length / cols);

    const group = new THREE.Group();
    const tiles = [];

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";

    projects.forEach((project, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const xOffset = col * dx + (row % 2 === 1 ? dx / 2 : 0);
      const yOffset = -row * dy;

      const tex = loader.load(project.image);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;

      // Side material (edge) + face material (image)
      const sideMat = new THREE.MeshStandardMaterial({
        color: 0x111e17, // dark emerald slate
        metalness: 0.4,
        roughness: 0.35,
      });
      const faceMat = new THREE.MeshStandardMaterial({
        map: tex,
        metalness: 0.1,
        roughness: 0.6,
        emissive: 0x000000,
      });
      const mesh = new THREE.Mesh(geom, [faceMat, sideMat]);
      mesh.position.set(xOffset, yOffset, 0);
      mesh.userData.baseZ = 0;
      group.add(mesh);
      tiles.push({
        mesh,
        base: mesh.position.clone(),
        project,
        index: i,
      });
    });

    // Center the group
    const totalW = dx * (cols - 1) + dx / 2;
    const totalH = dy * (rows - 1);
    group.position.x = -totalW / 2;
    group.position.y = totalH / 2;
    scene.add(group);

    // Scroll offset (within hive) for long queues
    let scrollY = 0;
    let targetScrollY = 0;
    const maxScroll = Math.max(0, totalH - 4.2);

    const onWheel = (e) => {
      e.preventDefault();
      targetScrollY = Math.max(0, Math.min(maxScroll, targetScrollY + e.deltaY * 0.005));
    };
    mount.addEventListener("wheel", onWheel, { passive: false });

    // Touch scroll
    let touchY = null;
    const onTouchStart = (e) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      if (touchY == null) return;
      const dyVal = touchY - e.touches[0].clientY;
      targetScrollY = Math.max(0, Math.min(maxScroll, targetScrollY + dyVal * 0.01));
      touchY = e.touches[0].clientY;
    };
    const onTouchEnd = () => {
      touchY = null;
    };
    mount.addEventListener("touchstart", onTouchStart, { passive: true });
    mount.addEventListener("touchmove", onTouchMove, { passive: true });
    mount.addEventListener("touchend", onTouchEnd);

    // Pointer interaction
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-2, -2);
    let hoveredIndex = -1;

    const onPointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const onPointerLeave = () => {
      pointer.x = -2;
      pointer.y = -2;
    };
    const onClick = () => {
      if (hoveredIndex >= 0) {
        const t = tiles[hoveredIndex];
        onSelectRef.current?.(t.project, t.index);
      }
    };
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerleave", onPointerLeave);
    mount.addEventListener("click", onClick);

    // Resize
    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(mount);

    // Animate
    let raf = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      scrollY += (targetScrollY - scrollY) * 0.12;
      group.position.y = totalH / 2 + scrollY;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(tiles.map((tt) => tt.mesh));
      const newHoverIndex = hits.length
        ? tiles.findIndex((tt) => tt.mesh === hits[0].object)
        : -1;

      if (newHoverIndex !== hoveredIndex) {
        hoveredIndex = newHoverIndex;
        mount.style.cursor = hoveredIndex >= 0 ? "pointer" : "grab";
      }

      tiles.forEach((tile, i) => {
        // Gentle floating
        const bob = Math.sin(t * 1.2 + i * 0.6) * 0.04;
        const targetZ = (i === hoveredIndex ? 0.6 : 0) + bob;
        tile.mesh.position.z += (targetZ - tile.mesh.position.z) * 0.15;

        // Tilt toward pointer
        const targetRotX = pointer.y * 0.15 + (i === hoveredIndex ? -0.15 : 0);
        const targetRotY = pointer.x * 0.2 + (i === hoveredIndex ? 0.15 : 0);
        tile.mesh.rotation.x += (targetRotX - tile.mesh.rotation.x) * 0.1;
        tile.mesh.rotation.y += (targetRotY - tile.mesh.rotation.y) * 0.1;

        // Hover emissive pulse (cyan/emerald color glow)
        const faceMat = tile.mesh.material[0];
        const targetEm = i === hoveredIndex ? 0.35 : 0;
        faceMat.emissive.setRGB(targetEm * 0.0, targetEm * 0.87, targetEm * 0.64);
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mount.removeEventListener("wheel", onWheel);
      mount.removeEventListener("touchstart", onTouchStart);
      mount.removeEventListener("touchmove", onTouchMove);
      mount.removeEventListener("touchend", onTouchEnd);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerleave", onPointerLeave);
      mount.removeEventListener("click", onClick);
      tiles.forEach((tt) => {
        const mats = tt.mesh.material;
        mats.forEach((m) => {
          m.map?.dispose();
          m.dispose();
        });
      });
      geom.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [projects]);

  return <div ref={mountRef} className="ps-hive3d" />;
}

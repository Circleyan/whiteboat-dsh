import {
  BufferGeometry, CatmullRomCurve3, ExtrudeGeometry, Float32BufferAttribute,
  Group, Mesh, MeshStandardMaterial, Path, Shape, ShapeGeometry, TubeGeometry,
  Vector2, Vector3,
} from "three";

// DSH's three-dimensional interpretation of the pinned, unbranded core artwork.
// Dimensions are modelling units, not a claim about a seaworthy physical craft.
export const BOAT_MODEL_LENGTH = 3.4;
const SVG_WIDTH = 24.4258;
const SVG_LENGTH = 68.769;
const UNIT = BOAT_MODEL_LENGTH / SVG_LENGTH;

/** Parse only the absolute M/L/H/V/C/Z commands used by the controlled core assets. */
function artworkPaths(dataUrl: string, offsetX = 0, offsetY = 0): Shape[] {
  const svg = decodeURIComponent(dataUrl.slice(dataUrl.indexOf(",") + 1));
  const paths: Shape[] = [];
  for (const match of svg.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)) {
    const tokens = match[1].match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) ?? [];
    let index = 0;
    let path: Shape | undefined;
    const point = () => {
      const x = Number(tokens[index++]);
      const y = Number(tokens[index++]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error("Invalid boat artwork point");
      return [(x + offsetX - SVG_WIDTH / 2) * UNIT, -(y + offsetY - SVG_LENGTH / 2) * UNIT] as const;
    };
    while (index < tokens.length) {
      const command = tokens[index++];
      if (command === "M") {
        path = new Shape();
        paths.push(path);
        path.moveTo(...point());
      } else if (command === "L" && path) {
        path.lineTo(...point());
      } else if (command === "H" && path) {
        path.lineTo((Number(tokens[index++]) + offsetX - SVG_WIDTH / 2) * UNIT, path.currentPoint.y);
      } else if (command === "V" && path) {
        path.lineTo(path.currentPoint.x, -(Number(tokens[index++]) + offsetY - SVG_LENGTH / 2) * UNIT);
      } else if (command === "C" && path) {
        path.bezierCurveTo(...point(), ...point(), ...point());
      } else if ((command === "Z" || command === "z") && path) {
        path.closePath();
      } else {
        throw new Error(`Unsupported boat artwork command: ${command}`);
      }
    }
  }
  if (!paths.length) throw new Error("Missing boat artwork outline");
  return paths;
}

function outlinePoints(shape: Shape, segments: number): Vector2[] {
  const points = shape.getSpacedPoints(segments);
  if (points[0].distanceTo(points[points.length - 1]) < 1e-6) points.pop();
  // Consistent counterclockwise order in the x/z plane for loft face winding.
  let area = 0;
  points.forEach((p, i) => {
    const q = points[(i + 1) % points.length];
    area += p.x * q.y - q.x * p.y;
  });
  if (area < 0) points.reverse();
  return points;
}

interface Ring { x: number; z: number; height: number }

/** Actual surface normals, an enclosed underside, and recessed interior walls. */
function loft(points: Vector2[], rings: Ring[], inward = false): BufferGeometry {
  const center = points.reduce((sum, p) => sum.add(p), new Vector2()).multiplyScalar(1 / points.length);
  const positions: number[] = [];
  const indices: number[] = [];
  for (const ring of rings) {
    for (const p of points) {
      positions.push(center.x + (p.x - center.x) * ring.x, ring.height, -(center.y + (p.y - center.y) * ring.z));
    }
  }
  const count = points.length;
  for (let r = 0; r < rings.length - 1; r++) {
    for (let i = 0; i < count; i++) {
      const a = r * count + i;
      const b = r * count + (i + 1) % count;
      const c = a + count;
      const d = b + count;
      if (inward) indices.push(a, b, c, b, d, c);
      else indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function createDshBoatModel(assets: { boatHull: string; boatWindow: string }): Group {
  const group = new Group();
  group.name = "Whiteboat";
  group.userData = { source: "whiteboat-core/boat-assets", forward: "-Z", up: "+Y", length: BOAT_MODEL_LENGTH };
  const hull = artworkPaths(assets.boatHull)[0];
  // The same placement as .wb-dsh-water__boat-window in the 2D reference.
  const wells = artworkPaths(assets.boatWindow, SVG_WIDTH * 0.1316, SVG_LENGTH * 0.2181);
  const outer = outlinePoints(hull, 128);
  const porcelain = new MeshStandardMaterial({ color: "#e5e7e8", roughness: 0.48, metalness: 0 });
  porcelain.name = "Satin white hull";
  const deckMaterial = new MeshStandardMaterial({ color: "#f2f3f2", roughness: 0.58, metalness: 0 });
  deckMaterial.name = "Soft white deck";
  // Keep the recessed cockpit readable under the directional light. The recess
  // still gets its depth from the geometry and material tone; receiving the
  // hull's self-shadow turned the three wells into near-black patches.
  const interior = new MeshStandardMaterial({ color: "#d0d6da", roughness: 0.82, metalness: 0 });
  interior.name = "Recessed grey interior";
  const floorMaterial = new MeshStandardMaterial({ color: "#c1c9ce", roughness: 0.9, metalness: 0 });
  floorMaterial.name = "Cockpit floor";
  function add(name: string, geometry: BufferGeometry, material: MeshStandardMaterial): Mesh {
    const mesh = new Mesh(geometry, material);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = !name.startsWith("Cockpit ");
    group.add(mesh);
    return mesh;
  }

  add("Curved hull", loft(outer, [
    { x: 1, z: 1, height: 0.21 },
    { x: 0.998, z: 0.999, height: 0.16 },
    { x: 0.978, z: 0.988, height: 0.07 },
    { x: 0.93, z: 0.967, height: -0.04 },
    { x: 0.84, z: 0.94, height: -0.15 },
    { x: 0.70, z: 0.90, height: -0.25 },
    { x: 0.51, z: 0.84, height: -0.32 },
    { x: 0.27, z: 0.75, height: -0.36 },
  ]), porcelain);
  const center = outer.reduce((sum, p) => sum.add(p), new Vector2()).multiplyScalar(1 / outer.length);
  const bottom = new Shape(outer.map(p => new Vector2(center.x + (p.x - center.x) * 0.27, center.y + (p.y - center.y) * 0.75)));
  const bottomGeometry = new ShapeGeometry(bottom);
  bottomGeometry.rotateX(Math.PI / 2);
  bottomGeometry.scale(1, 1, -1);
  // Reflection changes winding; explicitly orient the cap downwards.
  const capIndex = bottomGeometry.getIndex()!;
  for (let i = 0; i < capIndex.count; i += 3) {
    const value = capIndex.getX(i + 1);
    capIndex.setX(i + 1, capIndex.getX(i + 2));
    capIndex.setX(i + 2, value);
  }
  bottomGeometry.computeVertexNormals();
  bottomGeometry.translate(0, -0.36, 0);
  add("Underside", bottomGeometry, porcelain);

  const deck = new Shape(outer);
  for (const well of wells) deck.holes.push(new Path(outlinePoints(well, 48)));
  const deckGeometry = new ExtrudeGeometry(deck, {
    depth: 0.035, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2, steps: 1, curveSegments: 8,
  });
  deckGeometry.rotateX(-Math.PI / 2);
  deckGeometry.translate(0, 0.19, 0);
  add("Deck and two thwarts", deckGeometry, deckMaterial);

  wells.forEach((well, i) => {
    const points = outlinePoints(well, 48);
    add(`Cockpit ${i + 1} walls`, loft(points, [
      { x: 1, z: 1, height: 0.21 },
      { x: 0.97, z: 0.99, height: 0.16 },
      { x: 0.84, z: 0.91, height: -0.09 },
      { x: 0.79, z: 0.88, height: -0.13 },
    ], true), interior);
    const middle = points.reduce((sum, p) => sum.add(p), new Vector2()).multiplyScalar(1 / points.length);
    const floor = new Shape(points.map(p => new Vector2(middle.x + (p.x - middle.x) * 0.79, middle.y + (p.y - middle.y) * 0.88)));
    const floorGeometry = new ShapeGeometry(floor);
    floorGeometry.rotateX(-Math.PI / 2);
    floorGeometry.translate(0, -0.13, 0);
    add(`Cockpit ${i + 1} floor`, floorGeometry, floorMaterial);
  });

  const rimPath = new CatmullRomCurve3(outer.map(p => new Vector3(p.x, 0.228, -p.y)), true, "centripetal");
  // A separate material confines the moon reflection to the existing outer rim.
  add("Rounded gunwale", new TubeGeometry(rimPath, 160, 0.013, 6, true), deckMaterial.clone());
  group.userData.gunwaleOutline = outer.map(p => new Vector2(p.x, -p.y));
  return group;
}

export function disposeDshBoatModel(group: Group): void {
  const materials = new Set<MeshStandardMaterial>();
  group.traverse(object => {
    if (!(object instanceof Mesh)) return;
    object.geometry.dispose();
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.add(material as MeshStandardMaterial);
    }
  });
  materials.forEach(material => material.dispose());
}

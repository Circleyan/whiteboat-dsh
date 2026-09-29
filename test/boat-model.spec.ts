import { describe, expect, it } from "vitest";
import { Box3, Mesh, Raycaster, Vector3 } from "three";
import { CANVAS_CREATION_BOAT_ASSETS } from "whiteboat-core/boat-assets";
import { createDshBoatModel, disposeDshBoatModel } from "../src/features/water-surface/boat-model";

describe("DSH three-dimensional boat", () => {
  it("preserves the shared silhouette while adding a real enclosed underside", () => {
    const model = createDshBoatModel(CANVAS_CREATION_BOAT_ASSETS);
    model.updateMatrixWorld(true);
    const size = new Box3().setFromObject(model).getSize(new Vector3());
    expect(size.z).toBeCloseTo(3.4, 1);
    expect(size.z / size.x).toBeGreaterThan(2.7);
    expect(size.z / size.x).toBeLessThan(2.9);
    expect(size.y).toBeGreaterThan(0.5);
    const hits = new Raycaster(new Vector3(0, -2, 0), new Vector3(0, 1, 0)).intersectObject(model);
    expect(hits[0]?.object.name).toBe("Underside");
    expect(hits[0]?.point.y).toBeCloseTo(-0.36);
    disposeDshBoatModel(model);
  });

  it("has three open recesses instead of painting three flat patches on a deck", () => {
    const model = createDshBoatModel(CANVAS_CREATION_BOAT_ASSETS);
    model.updateMatrixWorld(true);
    const floors = model.children.filter(mesh => /Cockpit .* floor/.test(mesh.name));
    expect(floors).toHaveLength(3);
    for (const floor of floors) {
      const center = new Box3().setFromObject(floor).getCenter(new Vector3());
      const hits = new Raycaster(new Vector3(center.x, 3, center.z), new Vector3(0, -1, 0)).intersectObject(model);
      expect(hits[0]?.object.name).toBe(floor.name);
      expect(hits[0]?.point.y).toBeLessThan(0);
    }
    disposeDshBoatModel(model);
  });

  it("keeps geometry finite, normalised and small enough for a moving UI object", () => {
    const model = createDshBoatModel(CANVAS_CREATION_BOAT_ASSETS);
    let triangles = 0;
    for (const object of model.children) {
      const mesh = object as Mesh;
      const position = mesh.geometry.getAttribute("position");
      const normal = mesh.geometry.getAttribute("normal");
      const index = mesh.geometry.getIndex();
      triangles += (index?.count ?? position.count) / 3;
      for (let i = 0; i < position.count; i++) {
        expect([position.getX(i), position.getY(i), position.getZ(i)].every(Number.isFinite)).toBe(true);
        expect(Math.hypot(normal.getX(i), normal.getY(i), normal.getZ(i))).toBeCloseTo(1, 4);
      }
      if (index) for (let i = 0; i < index.count; i++) expect(index.getX(i)).toBeLessThan(position.count);
    }
    expect(triangles).toBeLessThan(10000);
    disposeDshBoatModel(model);
  });
});

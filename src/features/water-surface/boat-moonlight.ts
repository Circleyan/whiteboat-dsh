import { MeshStandardMaterial, Vector2, Vector3 } from "three";

const declarations = /* glsl */ `
uniform vec3 wbMoonDirection;
uniform vec3 wbMoonModelDirection;
uniform float wbMoonStrength;
uniform vec2 wbGunwaleOutline[128];
varying vec3 wbGunwalePosition;
`;
const reflection = /* glsl */ `
// Real surface normals and the same moon vector as the key light.
if (wbMoonStrength > 0.0) {
  float wbMoonDistance2 = 1000.0;
  vec2 wbMoonOutward = vec2(0.0);
  for (int i = 0; i < 128; i++) {
    vec2 a = wbGunwaleOutline[i];
    vec2 edge = wbGunwaleOutline[(i + 1) % 128] - a;
    vec2 point = wbGunwalePosition.xz - a;
    float t = clamp(dot(point, edge) / dot(edge, edge), 0.0, 1.0);
    vec2 offset = point - t * edge;
    float distance2 = dot(offset, offset);
    if (distance2 < wbMoonDistance2) {
      wbMoonDistance2 = distance2;
      // The original CCW artwork becomes clockwise in the model's X/Z plane.
      wbMoonOutward = normalize(vec2(-edge.y, edge.x));
    }
  }
  vec3 wbMoonHalf = normalize(wbMoonDirection + geometryViewDir);
  float wbMoonIncidence = max(dot(normal, wbMoonDirection), 0.0);
  float wbMoonFacing = max(dot(wbMoonOutward, wbMoonModelDirection.xz), 0.0);
  float wbMoonGlint = pow(max(dot(normal, wbMoonHalf), 0.0), 20.0);
  float wbMoonFeather = exp(-wbMoonDistance2 / (0.04 * 0.04));
  reflectedLight.directSpecular += vec3(1.0, 0.82, 0.51)
    * (0.80 * wbMoonStrength * wbMoonIncidence * wbMoonGlint * wbMoonFacing * wbMoonFacing * wbMoonFeather);
}
`;

/** A moon-only champagne reflection feathered inward from the existing outer edge. */
export function createBoatMoonlight(outline: Vector2[]) {
  const direction = { value: new Vector3() };
  const modelDirection = { value: new Vector3() };
  const strength = { value: 0 };
  return {
    attach(material: MeshStandardMaterial) {
      const compile = material.onBeforeCompile;
      const cacheKey = material.customProgramCacheKey();
      material.onBeforeCompile = (shader, renderer) => {
        compile.call(material, shader, renderer);
        shader.uniforms.wbMoonDirection = direction;
        shader.uniforms.wbMoonModelDirection = modelDirection;
        shader.uniforms.wbMoonStrength = strength;
        shader.uniforms.wbGunwaleOutline = { value: outline };
        shader.vertexShader = "varying vec3 wbGunwalePosition;\n" + shader.vertexShader.replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nwbGunwalePosition = position;",
        );
        shader.fragmentShader = declarations + shader.fragmentShader.replace(
          "#include <lights_fragment_end>",
          "#include <lights_fragment_end>\n" + reflection,
        );
      };
      material.customProgramCacheKey = () => cacheKey + "-moon-gunwale-v1";
    },
    update(viewDirection: Vector3, intensity: number, localDirection: Vector3) {
      direction.value.copy(viewDirection);
      modelDirection.value.copy(localDirection);
      strength.value = intensity;
    },
  };
}

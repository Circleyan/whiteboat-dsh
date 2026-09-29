import { MeshStandardMaterial, Vector3 } from "three";

// Calibrated to the user's approved light C / dark E rendered references.
// Fixed pivots keep the sunlight/moonlight response continuous over time.
export const BOAT_TONE_DAY = Object.freeze({ pivot: 0.87273446, lift: 0.03076517, shadows: 0.65 });
export const BOAT_TONE_NIGHT = Object.freeze({ pivot: 0.27621250, lift: 0.08, shadows: 0.75 });

const gradeShader = /* glsl */ `
uniform vec3 wbBoatTone;
vec3 wbBoatGrade(vec3 rgb) {
  vec3 lms = vec3(
    dot(rgb, vec3(0.4122214708, 0.5363325363, 0.0514459929)),
    dot(rgb, vec3(0.2119034982, 0.6806995451, 0.1073969566)),
    dot(rgb, vec3(0.0883024619, 0.2817188376, 0.6299787005))
  );
  lms = pow(max(lms, vec3(0.0)), vec3(1.0 / 3.0));
  vec3 lab = vec3(
    dot(lms, vec3(0.2104542553, 0.7936177850, -0.0040720468)),
    dot(lms, vec3(1.9779984951, -2.4285922050, 0.4505937099)),
    dot(lms, vec3(0.0259040371, 0.7827717662, -0.8086757660))
  );
  float lift = wbBoatTone.y + (1.0 - wbBoatTone.z) * max(wbBoatTone.x - lab.x, 0.0);
  // Roll off only the brightest highlights to keep room for a moonlit rim.
  float shoulder = min(1.0, max(1.0 - lab.x, 0.0) / 0.12);
  lab.x += lift * shoulder;
  lms = vec3(
    lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z,
    lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z,
    lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z
  );
  lms = lms * lms * lms;
  return clamp(vec3(
    dot(lms, vec3(4.0767416621, -3.3077115913, 0.2309699292)),
    dot(lms, vec3(-1.2684380046, 2.6097574011, -0.3413193965)),
    dot(lms, vec3(-0.0041960863, -0.7034186147, 1.7076147010))
  ), 0.0, 1.0);
}
`;

/** Grades lit linear RGB after ACES and before output encoding; leaves alpha alone. */
export function createBoatToneGrade() {
  const uniform = { value: new Vector3(BOAT_TONE_DAY.pivot, BOAT_TONE_DAY.lift, BOAT_TONE_DAY.shadows) };
  return {
    attach(material: MeshStandardMaterial) {
      material.onBeforeCompile = (shader) => {
        shader.uniforms.wbBoatTone = uniform;
        shader.fragmentShader = gradeShader + shader.fragmentShader.replace(
          "#include <tonemapping_fragment>",
          "#include <tonemapping_fragment>\n gl_FragColor.rgb = wbBoatGrade(gl_FragColor.rgb);",
        );
      };
      material.customProgramCacheKey = () => "whiteboat-boat-tone-light-c-dark-e-v1";
    },
    setNight(night: boolean) {
      const tone = night ? BOAT_TONE_NIGHT : BOAT_TONE_DAY;
      uniform.value.set(tone.pivot, tone.lift, tone.shadows);
    },
  };
}

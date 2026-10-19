# Fish Generator v10 (split for GitHub)

The original was one 506 KB HTML file. It is split so every file is under 30 KB.

## Rebuild the runnable app
    node build.mjs   # writes dist/Fish_generator_v10.html (byte-identical to the original)

Open that HTML file in a browser. It loads Tailwind and the three.js import map from CDNs, as the original did, so it needs internet.

## Layout
- `index.template.html`: page shell (head, small error-overlay script, import map, UI markup) with `{{CSS}}` and `{{APP}}` placeholders
- `css/style.css`: all styles
- `js/app.partNN.js`: the single ES-module script cut into ordered parts at top-level statement boundaries. They are consecutive pieces of ONE module sharing scope, not separate modules. Each starts with a `// @@PART` header line that the build strips.

## Parts (read in order)
| File | Bytes | Original lines | Top-level names |
|---|---|---|---|
| `js/app.part01.js` | 27281 | 173-382 | FG, TAU, clamp, lerp, sstep, smoother, gaussf, isNum ... |
| `js/app.part02.js` | 27585 | 383-425 |  |
| `js/app.part03.js` | 27476 | 426-466 |  |
| `js/app.part04.js` | 27781 | 467-628 | cladePath, cladeTags, cladeReq, cladeDistance, FORM_RULES, NICHES, NI, HABITATS ... |
| `js/app.part05.js` | 27869 | 629-813 | SPC |
| `js/app.part06.js` | 27280 | 814-1026 | ANATOMY, mergeAnatomy, anatomyProfile, ECOLOGY_LIMITS, ecologyProfile, depthBand, cladeInNiche, bodyProfile ... |
| `js/app.part07.js` | 26858 | 1027-1261 | metrics, RULES, RULE, clampLog, setLog, repair, violations, narrow ... |
| `js/app.part08.js` | 27872 | 1262-1557 | nameFish, finalize, generate, adaptToHabitat, ADAPTATIONS, traitBounds, applyAdaptation, EVOLUTION_LIMITS ... |
| `js/app.part09.js` | 27554 | 1558-1847 | findSpecies, findHabitat, genomeFromText, schemaSummary, extractJSON, genomeFromLLM, unflatten, selfTestData ... |
| `js/app.part10.js` | 27369 | 1848-2150 | buildJawGeometry, skinAttributes, buildMouthDetails, buildMantaMouth, buildOralDisc, buildGills, triArea, FinBuilder ... |
| `js/app.part11.js` | 27259 | 2151-2428 | buildSpecials, landmarks3D, buildFish, ENV, FLAP, GLSL_SWIM, GLSL_COMMON_FS, GLSL_PIGMENT ... |
| `js/app.part12.js` | 26731 | 2429-2608 | FS_EYE, VS_SIMPLE, FS_SIMPLE, FS_GLOW, hslCol, makeUniforms, makeMaterials, FS_POST ... |
| `js/app.part13.js` | 24917 | 2609-2814 | School, setFish, frameCamera, tweenCamera, setCameraView, undoFish, startSchool, stopSchool ... |
| `js/app.part14.js` | 26154 | 2815-2937 | PANELS, fmt, editTimer, syncInspector, thumbQueue, requestThumb |
| `js/app.part15.js` | 26885 | 2938-3227 | pumpThumbs, pigmentAt, exportGLB, TEST_STATE, runFocusedTests, checkFishGeometry, runSelfTest, mixC ... |
| `js/app.part16.js` | 27891 | 3228-3390 | structuralAudit, both, SYN, hybridize, ROLE_TXT, roleOf, PAL_PULL, adaptHab ... |
| `js/app.part17.js` | 26736 | 3391-3568 | adaptFinish, rehabitat, parentFrom, phenoDelta, mx, NOSNOUT, NOVELTIES, NOV ... |
| `js/app.part18.js` | 23234 | 3569-3749 | evolve, WONDER_HIST, wonderCandidate, doWonder, pressNiche, doMix, runEvolve, doMutate ... |
| `js/app.part19.js` | 7953 | 3750-3821 | runHybridTests, bindUI, boot |

import { ELEMENTS, CATEGORIES, CRYSTAL_SYSTEMS } from '../js/data/elements.js';

let errors = 0;
function fail(msg) {
  console.error(`ERROR: ${msg}`);
  errors++;
}

if (ELEMENTS.length !== 118) {
  fail(`Expected 118 elements, got ${ELEMENTS.length}`);
}

const seenZ = new Set();
const seenSymbols = new Set();

for (let i = 0; i < ELEMENTS.length; i++) {
  const el = ELEMENTS[i];
  const expectedZ = i + 1;
  if (el.z !== expectedZ) fail(`Index ${i} has z=${el.z}, expected ${expectedZ}`);
  if (seenZ.has(el.z)) fail(`Duplicate Z=${el.z}`);
  seenZ.add(el.z);

  if (seenSymbols.has(el.symbol)) fail(`Duplicate symbol=${el.symbol}`);
  seenSymbols.add(el.symbol);

  if (!CATEGORIES[el.category]) fail(`Z=${el.z} invalid category '${el.category}'`);
  if (!CRYSTAL_SYSTEMS[el.crystal?.type]) fail(`Z=${el.z} invalid crystal type '${el.crystal?.type}'`);
  if (!['s', 'p', 'd', 'f'].includes(el.block)) fail(`Z=${el.z} invalid block '${el.block}'`);
  if (!Number.isFinite(el.col) || el.col < 1 || el.col > 18) fail(`Z=${el.z} invalid col=${el.col}`);
  if (!Number.isFinite(el.row) || el.row < 1 || el.row > 10) fail(`Z=${el.z} invalid row=${el.row}`);

  const shellSum = el.shells.reduce((a, b) => a + b, 0);
  if (shellSum !== el.z) fail(`Z=${el.z} (${el.symbol}) shells sum=${shellSum} != ${el.z}: [${el.shells}]`);

  const subshellSum = el.subshells.reduce((a, b) => a + b.count, 0);
  if (subshellSum !== el.z) fail(`Z=${el.z} (${el.symbol}) subshells sum=${subshellSum} != ${el.z}`);
}

if (errors > 0) {
  console.error(`Validation failed with ${errors} error(s).`);
  process.exit(1);
}

console.log('PASS: All 118 elements validated cleanly (Z=1..118, shells, subshells, categories, crystals, coordinates).');

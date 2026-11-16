export const CATEGORIES = {
  'alkali-metal': {
    name: 'Alkali Metal',
    color: '#ff5d6c',
    glow: '#ff8a95',
    bg: 'rgba(255, 93, 108, 0.16)'
  },
  'alkaline-earth': {
    name: 'Alkaline Earth Metal',
    color: '#ff9e44',
    glow: '#ffbe7d',
    bg: 'rgba(255, 158, 68, 0.16)'
  },
  'transition-metal': {
    name: 'Transition Metal',
    color: '#f5c443',
    glow: '#ffe082',
    bg: 'rgba(245, 196, 67, 0.16)'
  },
  'post-transition-metal': {
    name: 'Post-Transition Metal',
    color: '#4ad295',
    glow: '#84ecc0',
    bg: 'rgba(74, 210, 149, 0.16)'
  },
  'metalloid': {
    name: 'Metalloid',
    color: '#2dd4bf',
    glow: '#72eee0',
    bg: 'rgba(45, 212, 191, 0.16)'
  },
  'reactive-nonmetal': {
    name: 'Reactive Nonmetal',
    color: '#4ea8ff',
    glow: '#8dc8ff',
    bg: 'rgba(78, 168, 255, 0.16)'
  },
  'noble-gas': {
    name: 'Noble Gas',
    color: '#a77dff',
    glow: '#cbb1ff',
    bg: 'rgba(167, 125, 255, 0.16)'
  },
  'lanthanide': {
    name: 'Lanthanide',
    color: '#f472b6',
    glow: '#f9a8d4',
    bg: 'rgba(244, 114, 182, 0.16)'
  },
  'actinide': {
    name: 'Actinide',
    color: '#fb7185',
    glow: '#fda4af',
    bg: 'rgba(251, 113, 133, 0.16)'
  },
  'unknown': {
    name: 'Unknown Properties',
    color: '#94a3b8',
    glow: '#cbd5e1',
    bg: 'rgba(148, 163, 184, 0.16)'
  }
};

export const CRYSTAL_SYSTEMS = {
  'fcc': {
    name: 'Face-Centered Cubic (FCC)',
    short: 'FCC',
    coordination: 12,
    apf: '74%',
    description: 'Close-packed cubic lattice with atoms at all 8 corners and 6 face centers.'
  },
  'bcc': {
    name: 'Body-Centered Cubic (BCC)',
    short: 'BCC',
    coordination: 8,
    apf: '68%',
    description: 'Cubic unit cell with 8 corner atoms and 1 central body atom.'
  },
  'hcp': {
    name: 'Hexagonal Close-Packed (HCP)',
    short: 'HCP',
    coordination: 12,
    apf: '74%',
    description: 'ABAB... stacked hexagonal layers achieving maximum sphere packing density.'
  },
  'diamond': {
    name: 'Diamond Cubic',
    short: 'Diamond',
    coordination: 4,
    apf: '34%',
    description: 'Two interpenetrating FCC lattices forming directional sp3 tetrahedral bonds.'
  },
  'sc': {
    name: 'Simple Cubic (SC)',
    short: 'SC',
    coordination: 6,
    apf: '52%',
    description: 'Primitive cubic lattice with atoms solely on the 8 corners (e.g., alpha-Polonium).'
  },
  'hexagonal': {
    name: 'Hexagonal Layered',
    short: 'Hexagonal',
    coordination: 3,
    apf: '38%',
    description: 'Layered hexagonal sheets or networks with strong intra-plane bonding.'
  },
  'rhombohedral': {
    name: 'Rhombohedral (Trigonal)',
    short: 'Rhombohedral',
    coordination: 6,
    apf: '50%',
    description: 'Distorted cubic lattice along the body diagonal, typical of pnictogens and mercury.'
  },
  'orthorhombic': {
    name: 'Orthorhombic',
    short: 'Orthorhombic',
    coordination: 6,
    apf: '56%',
    description: 'Rectangular prism unit cell with three unequal orthogonal lattice axes (a != b != c).'
  },
  'tetragonal': {
    name: 'Tetragonal',
    short: 'Tetragonal',
    coordination: 6,
    apf: '60%',
    description: 'Stretched cubic prism with a = b != c and 90-degree interaxial angles.'
  },
  'monoclinic': {
    name: 'Monoclinic',
    short: 'Monoclinic',
    coordination: 4,
    apf: '48%',
    description: 'Oblique prism unit cell with one non-90-degree angle (beta != 90 deg).'
  },
  'molecular-cubic': {
    name: 'Molecular Cubic (Solidified Gas)',
    short: 'Molecular',
    coordination: 12,
    apf: '62%',
    description: 'Cryogenic solid where discrete diatomic molecules occupy FCC lattice sites.'
  }
};

const AUFBAU_ORDER = [
  { n: 1, l: 0, label: '1s', cap: 2 },
  { n: 2, l: 0, label: '2s', cap: 2 },
  { n: 2, l: 1, label: '2p', cap: 6 },
  { n: 3, l: 0, label: '3s', cap: 2 },
  { n: 3, l: 1, label: '3p', cap: 6 },
  { n: 4, l: 0, label: '4s', cap: 2 },
  { n: 3, l: 2, label: '3d', cap: 10 },
  { n: 4, l: 1, label: '4p', cap: 6 },
  { n: 5, l: 0, label: '5s', cap: 2 },
  { n: 4, l: 2, label: '4d', cap: 10 },
  { n: 5, l: 1, label: '5p', cap: 6 },
  { n: 6, l: 0, label: '6s', cap: 2 },
  { n: 4, l: 3, label: '4f', cap: 14 },
  { n: 5, l: 2, label: '5d', cap: 10 },
  { n: 6, l: 1, label: '6p', cap: 6 },
  { n: 7, l: 0, label: '7s', cap: 2 },
  { n: 5, l: 3, label: '5f', cap: 14 },
  { n: 6, l: 2, label: '6d', cap: 10 },
  { n: 7, l: 1, label: '7p', cap: 6 }
];

const CONFIG_EXCEPTIONS = {
  24: { '3d': 5, '4s': 1 },
  29: { '3d': 10, '4s': 1 },
  41: { '4d': 4, '5s': 1 },
  42: { '4d': 5, '5s': 1 },
  44: { '4d': 7, '5s': 1 },
  45: { '4d': 8, '5s': 1 },
  46: { '4d': 10, '5s': 0 },
  47: { '4d': 10, '5s': 1 },
  57: { '4f': 0, '5d': 1, '6s': 2 },
  58: { '4f': 1, '5d': 1, '6s': 2 },
  64: { '4f': 7, '5d': 1, '6s': 2 },
  78: { '4f': 14, '5d': 9, '6s': 1 },
  79: { '4f': 14, '5d': 10, '6s': 1 },
  89: { '5f': 0, '6d': 1, '7s': 2 },
  90: { '5f': 0, '6d': 2, '7s': 2 },
  91: { '5f': 2, '6d': 1, '7s': 2 },
  92: { '5f': 3, '6d': 1, '7s': 2 },
  93: { '5f': 4, '6d': 1, '7s': 2 },
  96: { '5f': 7, '6d': 1, '7s': 2 },
  103: { '5f': 14, '6d': 0, '7s': 2, '7p': 1 }
};

const SUPERSCRIPTS = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
};

function toSup(num) {
  return String(num).split('').map((d) => SUPERSCRIPTS[d] || d).join('');
}

const NOBLE_CORES = [
  { z: 86, symbol: 'Rn', maxN: 6, labels: new Set(['1s','2s','2p','3s','3p','4s','3d','4p','5s','4d','5p','6s','4f','5d','6p']) },
  { z: 54, symbol: 'Xe', maxN: 5, labels: new Set(['1s','2s','2p','3s','3p','4s','3d','4p','5s','4d','5p']) },
  { z: 36, symbol: 'Kr', maxN: 4, labels: new Set(['1s','2s','2p','3s','3p','4s','3d','4p']) },
  { z: 18, symbol: 'Ar', maxN: 3, labels: new Set(['1s','2s','2p','3s','3p']) },
  { z: 10, symbol: 'Ne', maxN: 2, labels: new Set(['1s','2s','2p']) },
  { z: 2, symbol: 'He', maxN: 1, labels: new Set(['1s']) }
];

function computeElectrons(z) {
  let rem = z;
  const counts = {};
  for (const orb of AUFBAU_ORDER) {
    if (rem <= 0) break;
    const take = Math.min(rem, orb.cap);
    counts[orb.label] = take;
    rem -= take;
  }

  if (CONFIG_EXCEPTIONS[z]) {
    for (const [label, val] of Object.entries(CONFIG_EXCEPTIONS[z])) {
      if (val === 0) {
        delete counts[label];
      } else {
        counts[label] = val;
      }
    }
  }

  // Sort in shell order (n ascending, then l ascending) for standard notation
  const subshells = AUFBAU_ORDER
    .filter((orb) => (counts[orb.label] || 0) > 0)
    .map((orb) => ({
      n: orb.n,
      l: orb.l,
      label: orb.label,
      count: counts[orb.label]
    }))
    .sort((a, b) => (a.n - b.n) || (a.l - b.l));

  const shellMap = new Map();
  for (const s of subshells) {
    shellMap.set(s.n, (shellMap.get(s.n) || 0) + s.count);
  }
  const maxShell = Math.max(...shellMap.keys());
  const shells = [];
  for (let n = 1; n <= maxShell; n++) {
    shells.push(shellMap.get(n) || 0);
  }

  const electronConfig = subshells.map((s) => `${s.label}${toSup(s.count)}`).join(' ');

  let nobleConfig = electronConfig;
  for (const core of NOBLE_CORES) {
    if (z > core.z) {
      const rest = subshells.filter((s) => !core.labels.has(s.label));
      nobleConfig = `[${core.symbol}] ${rest.map((s) => `${s.label}${toSup(s.count)}`).join(' ')}`;
      break;
    }
  }

  return { subshells, shells, electronConfig, nobleConfig };
}

// Tuple compact format:
// [z, symbol, name, mass, category, block, period, group, col, row, phase, radius, en, ie, density, melt, boil, crystalType, a, c, crystalNote, year, summary]
const RAW_ELEMENTS = [
  [1,'H','Hydrogen',1.008,'reactive-nonmetal','s',1,1,1,1,'Gas',53,2.20,1312,0.00008988,14.01,20.28,'molecular-cubic',3.75,null,'Hexagonal/cubic solid H2 below 14 K',1766,'The lightest and most abundant chemical element in the universe, fueling stars via nuclear fusion.'],
  [2,'He','Helium',4.0026,'noble-gas','s',1,18,18,1,'Gas',31,null,2372,0.0001785,0.95,4.22,'hcp',3.57,5.84,'HCP solid helium under high pressure',1868,'Colorless, inert noble gas with the lowest boiling point of any element; exhibits superfluidity near 0 K.'],
  [3,'Li','Lithium',6.94,'alkali-metal','s',2,1,1,2,'Solid',167,0.98,520,0.534,453.65,1615,'bcc',3.51,null,'Body-centered cubic metal at STP',1817,'The least dense solid element and metal; central to high-energy rechargeable lithium-ion batteries.'],
  [4,'Be','Beryllium',9.0122,'alkaline-earth','s',2,2,2,2,'Solid',112,1.57,900,1.85,1560,2742,'hcp',2.29,3.58,'Hexagonal close-packed metal',1798,'Lightweight, rigid alkaline earth metal transparent to X-rays and used in aerospace mirrors.'],
  [5,'B','Boron',10.81,'metalloid','p',2,13,13,2,'Solid',87,2.04,801,2.34,2349,4200,'rhombohedral',5.06,null,'B12 icosahedral rhombohedral network',1808,'Hard refractory metalloid forming icosahedral clusters; vital for borosilicate glass and semiconductors.'],
  [6,'C','Carbon',12.011,'reactive-nonmetal','p',2,14,14,2,'Solid',67,2.55,1087,2.267,3823,4098,'diamond',3.57,null,'Diamond cubic (sp3) / Graphite hexagonal (sp2)',null,'Backbone of organic chemistry and life; forms diamond, graphite, graphene, and fullerenes.'],
  [7,'N','Nitrogen',14.007,'reactive-nonmetal','p',2,15,15,2,'Gas',56,3.04,1402,0.0012506,63.15,77.36,'molecular-cubic',5.66,null,'Alpha-N2 cubic molecular crystal below 35.6 K',1772,'Makes up 78% of Earth atmosphere as strongly triple-bonded N2; essential to amino acids and DNA.'],
  [8,'O','Oxygen',15.999,'reactive-nonmetal','p',2,16,16,2,'Gas',48,3.44,1314,0.001429,54.36,90.20,'monoclinic',5.40,3.43,'Alpha-O2 monoclinic paramagnetic solid',1774,'Highly reactive chalcogen essential for aerobic respiration and comprising nearly half of Earth crust by mass.'],
  [9,'F','Fluorine',18.998,'reactive-nonmetal','p',2,17,17,2,'Gas',42,3.98,1681,0.001696,53.53,85.03,'monoclinic',5.50,3.28,'Alpha-F2 monoclinic diatomic crystal',1886,'The most electronegative and chemically reactive element, forming compounds even with heavy noble gases.'],
  [10,'Ne','Neon',20.180,'noble-gas','p',2,18,18,2,'Gas',38,null,2081,0.0008999,24.56,27.07,'fcc',4.43,null,'Face-centered cubic van der Waals crystal below 24 K',1898,'Inert noble gas producing bright reddish-orange luminescence in high-voltage discharge tubes.'],
  [11,'Na','Sodium',22.990,'alkali-metal','s',3,1,1,3,'Solid',190,0.93,496,0.968,370.94,1156,'bcc',4.29,null,'Body-centered cubic alkali metal',1807,'Soft silvery alkali metal that reacts vigorously with water and emits iconic yellow D-line light.'],
  [12,'Mg','Magnesium',24.305,'alkaline-earth','s',3,2,2,3,'Solid',145,1.31,738,1.738,923,1363,'hcp',3.21,5.21,'Hexagonal close-packed light alloy metal',1755,'Lightweight structural metal burning with a brilliant white flame; sits at the center of chlorophyll.'],
  [13,'Al','Aluminum',26.982,'post-transition-metal','p',3,13,13,3,'Solid',118,1.61,578,2.70,933.47,2792,'fcc',4.05,null,'Face-centered cubic ductile metal',1825,'The most abundant metal in Earth crust, prized for low density, corrosion resistance, and conductivity.'],
  [14,'Si','Silicon',28.085,'metalloid','p',3,14,14,3,'Solid',111,1.90,787,2.329,1687,3538,'diamond',5.43,null,'Diamond cubic semiconductor lattice',1824,'Tetravalent metalloid forming the foundation of modern microelectronics, solar cells, and silicate minerals.'],
  [15,'P','Phosphorus',30.974,'reactive-nonmetal','p',3,15,15,3,'Solid',98,2.19,1012,1.823,317.3,553.7,'orthorhombic',3.31,10.48,'Black phosphorus layered orthorhombic (white P is cubic)',1669,'Multiform nonmetal critical to ATP energy transfer, cell membranes, and nucleic acid backbones.'],
  [16,'S','Sulfur',32.06,'reactive-nonmetal','p',3,16,16,3,'Solid',88,2.58,1000,2.07,388.36,717.8,'orthorhombic',10.47,24.49,'Alpha-S8 orthorhombic ring crystal',null,'Bright yellow nonmetal forming puckered S8 rings; indispensable in vulcanized rubber and sulfuric acid.'],
  [17,'Cl','Chlorine',35.45,'reactive-nonmetal','p',3,17,17,3,'Gas',79,3.16,1251,0.003214,171.6,239.11,'orthorhombic',6.24,8.26,'Orthorhombic molecular Cl2 crystal below 171 K',1774,'Yellow-green halogen gas widely used in water purification, polymers (PVC), and table salt.'],
  [18,'Ar','Argon',39.948,'noble-gas','p',3,18,18,3,'Gas',71,null,1521,0.001784,83.80,87.30,'fcc',5.26,null,'Face-centered cubic solid argon below 84 K',1894,'Third most abundant gas in Earth atmosphere (~0.93%), used as an inert shielding gas in welding.'],
  [19,'K','Potassium',39.098,'alkali-metal','s',4,1,1,4,'Solid',243,0.82,419,0.862,336.7,1032,'bcc',5.33,null,'Body-centered cubic alkali metal',1807,'Soft reactive alkali metal vital for nerve impulse transmission and plant nutrition.'],
  [20,'Ca','Calcium',40.078,'alkaline-earth','s',4,2,2,4,'Solid',194,1.00,590,1.55,1115,1757,'fcc',5.58,null,'Face-centered cubic metal at STP',1808,'Reactive alkaline earth metal forming bones, teeth, shells, and limestone minerals.'],
  [21,'Sc','Scandium',44.956,'transition-metal','d',4,3,3,4,'Solid',184,1.36,633,2.985,1814,3109,'hcp',3.31,5.27,'Hexagonal close-packed early transition metal',1879,'Silvery-white d-block metal used to strengthen high-performance aluminum aerospace alloys.'],
  [22,'Ti','Titanium',47.867,'transition-metal','d',4,4,4,4,'Solid',176,1.54,659,4.506,1941,3560,'hcp',2.95,4.68,'Alpha-Ti hexagonal close-packed lattice',1791,'Renowned for the highest strength-to-density ratio of any metallic element and extreme corrosion immunity.'],
  [23,'V','Vanadium',50.942,'transition-metal','d',4,5,5,4,'Solid',171,1.63,651,6.11,2183,3680,'bcc',3.02,null,'Body-centered cubic refractory metal',1801,'Ductile transition metal whose addition creates high-strength tool steels and redox flow batteries.'],
  [24,'Cr','Chromium',51.996,'transition-metal','d',4,6,6,4,'Solid',166,1.66,653,7.15,2180,2944,'bcc',2.88,null,'Body-centered cubic lustrous metal',1797,'Hard, mirror-bright transition metal responsible for stainless steel corrosion resistance and ruby color.'],
  [25,'Mn','Manganese',54.938,'transition-metal','d',4,7,7,4,'Solid',161,1.55,717,7.21,1519,2334,'bcc',8.91,null,'Complex cubic alpha-Mn (approximated BCC cell)',1774,'Essential steelmaking alloy that removes oxygen and sulfur while boosting toughness and wear resistance.'],
  [26,'Fe','Iron',55.845,'transition-metal','d',4,8,8,4,'Solid',156,1.83,763,7.874,1811,3134,'bcc',2.87,null,'Alpha-Fe (ferrite) body-centered cubic ferromagnetic',null,'Cornerstone of metallurgy and hemoglobin; forms Earth core and transitions between BCC and FCC phases.'],
  [27,'Co','Cobalt',58.933,'transition-metal','d',4,9,9,4,'Solid',152,1.88,760,8.90,1768,3200,'hcp',2.51,4.07,'Epsilon-Co hexagonal close-packed ferromagnetic',1735,'Ferromagnetic metal behind deep cobalt-blue pigments, superalloys, and lithium-ion cathodes.'],
  [28,'Ni','Nickel',58.693,'transition-metal','d',4,10,10,4,'Solid',149,1.91,737,8.908,1728,3186,'fcc',3.52,null,'Face-centered cubic ferromagnetic metal',1751,'Corrosion-resistant silvery metal used in stainless steels, superalloys, and hydrogenation catalysts.'],
  [29,'Cu','Copper',63.546,'transition-metal','d',4,11,11,4,'Solid',145,1.90,745,8.96,1357.77,2835,'fcc',3.61,null,'Face-centered cubic coinage metal',null,'Reddish-gold metal with exceptional electrical and thermal conductivity; first metal smelted by humanity.'],
  [30,'Zn','Zinc',65.38,'transition-metal','d',4,12,12,4,'Solid',142,1.65,906,7.14,692.68,1180,'hcp',2.66,4.95,'Elongated hexagonal close-packed crystal',1746,'Bluish-silver metal used to galvanize steel against rust and essential for over 300 human enzymes.'],
  [31,'Ga','Gallium',69.723,'post-transition-metal','p',4,13,13,4,'Solid',136,1.81,579,5.91,302.91,2673,'orthorhombic',4.52,7.66,'Orthorhombic Ga2 dimer-layered crystal',1875,'Melts right in a human hand (29.8 C) and forms GaAs/GaN semiconductors for LEDs and RF chips.'],
  [32,'Ge','Germanium',72.630,'metalloid','p',4,14,14,4,'Solid',125,2.01,762,5.323,1211.4,3106,'diamond',5.66,null,'Diamond cubic semiconductor crystal',1886,'Lustrous metalloid used in the very first transistors, infrared optics, and fiber-optic cores.'],
  [33,'As','Arsenic',74.922,'metalloid','p',4,15,15,4,'Solid',114,2.18,947,5.727,1090,887,'rhombohedral',4.13,null,'Grey arsenic rhombohedral puckered layers',null,'Classic metalloid used in III-V semiconductors (GaAs) and lead-acid battery grid alloys.'],
  [34,'Se','Selenium',78.971,'reactive-nonmetal','p',4,16,16,4,'Solid',103,2.55,941,4.81,494,958,'hexagonal',4.37,4.95,'Trigonal/hexagonal helical chain crystal',1817,'Photoconductive nonmetal whose electrical conductivity jumps dramatically under illumination.'],
  [35,'Br','Bromine',79.904,'reactive-nonmetal','p',4,17,17,4,'Liquid',94,2.96,1140,3.1028,265.8,332.0,'orthorhombic',6.68,8.74,'Orthorhombic molecular Br2 crystal below -7.2 C',1826,'The only nonmetallic element that is liquid at room temperature, fuming with deep reddish-brown vapor.'],
  [36,'Kr','Krypton',83.798,'noble-gas','p',4,18,18,4,'Gas',88,3.00,1351,0.003749,115.78,119.93,'fcc',5.72,null,'Face-centered cubic solid krypton below 116 K',1898,'Heavy noble gas whose 605.78 nm emission line once defined the international meter standard.'],
  [37,'Rb','Rubidium',85.468,'alkali-metal','s',5,1,1,5,'Solid',265,0.82,403,1.532,312.45,961,'bcc',5.59,null,'Body-centered cubic alkali metal',1861,'Soft, hyper-reactive alkali metal used in precision atomic clocks and Bose-Einstein condensate experiments.'],
  [38,'Sr','Strontium',87.62,'alkaline-earth','s',5,2,2,5,'Solid',219,0.95,549,2.64,1050,1650,'fcc',6.08,null,'Face-centered cubic metal at STP',1790,'Alkaline earth metal producing vivid crimson colors in flares and used in optical lattice clocks.'],
  [39,'Y','Yttrium',88.906,'transition-metal','d',5,3,3,5,'Solid',212,1.22,600,4.472,1799,3609,'hcp',3.65,5.73,'Hexagonal close-packed transition metal',1794,'Silvery metal essential to YAG lasers, red phosphors, and YBCO high-temperature superconductors.'],
  [40,'Zr','Zirconium',91.224,'transition-metal','d',5,4,4,5,'Solid',206,1.33,640,6.52,2128,4682,'hcp',3.23,5.15,'Alpha-Zr hexagonal close-packed lattice',1789,'Corrosion-proof metal with low neutron absorption, ideal for nuclear fuel cladding and cubic zirconia.'],
  [41,'Nb','Niobium',92.906,'transition-metal','d',5,5,5,5,'Solid',198,1.60,652,8.57,2750,5017,'bcc',3.30,null,'Body-centered cubic superconducting metal',1801,'Ductile refractory metal forming NbTi and Nb3Sn superconducting magnets for MRI and particle accelerators.'],
  [42,'Mo','Molybdenum',95.95,'transition-metal','d',5,6,6,5,'Solid',190,2.16,684,10.28,2896,4912,'bcc',3.15,null,'Body-centered cubic refractory metal',1778,'High-melting transition metal strengthening structural steels and catalyzing biological nitrogen fixation.'],
  [43,'Tc','Technetium',98,'transition-metal','d',5,7,7,5,'Solid',183,1.90,702,11.0,2430,4538,'hcp',2.74,4.40,'Hexagonal close-packed radioactive metal',1937,'Lightest element with no stable isotopes; metastable Tc-99m powers millions of medical imaging scans yearly.'],
  [44,'Ru','Ruthenium',101.07,'transition-metal','d',5,8,8,5,'Solid',178,2.20,710,12.45,2607,4423,'hcp',2.71,4.28,'Hexagonal close-packed platinum-group metal',1844,'Hard platinum-group catalyst driving olefin metathesis, solar dye cells, and wear-resistant contacts.'],
  [45,'Rh','Rhodium',102.91,'transition-metal','d',5,9,9,5,'Solid',173,2.28,720,12.41,2237,3968,'fcc',3.80,null,'Face-centered cubic noble metal',1803,'Ultra-reflective, inert precious metal essential to automotive three-way catalytic converters.'],
  [46,'Pd','Palladium',106.42,'transition-metal','d',5,10,10,5,'Solid',169,2.20,804,12.023,1828.05,3236,'fcc',3.89,null,'Face-centered cubic metal (absorbs 900x H2 volume)',1803,'Noble metal capable of absorbing hundreds of times its own volume of hydrogen gas; key cross-coupling catalyst.'],
  [47,'Ag','Silver',107.87,'transition-metal','d',5,11,11,5,'Solid',165,1.93,731,10.49,1234.93,2435,'fcc',4.09,null,'Face-centered cubic coinage metal',null,'Possesses the highest electrical conductivity, thermal conductivity, and optical reflectivity of any metal.'],
  [48,'Cd','Cadmium',112.41,'transition-metal','d',5,12,12,5,'Solid',161,1.69,868,8.65,594.22,1040,'hcp',2.98,5.62,'Stretched hexagonal close-packed metal',1817,'Soft bluish-white metal used in quantum dot displays (CdSe) and neutron-absorbing control rods.'],
  [49,'In','Indium',114.82,'post-transition-metal','p',5,13,13,5,'Solid',156,1.78,558,7.31,429.75,2345,'tetragonal',3.25,4.95,'Face-centered tetragonal soft metal',1863,'Extremely soft metal that "cries" when bent and forms transparent ITO touchscreens.'],
  [50,'Sn','Tin',118.71,'post-transition-metal','p',5,14,14,5,'Solid',145,1.96,709,7.365,505.08,2875,'tetragonal',5.83,3.18,'Beta-Sn (white tin) body-centered tetragonal',null,'Malleable metal of Bronze Age fame; shifts from metallic white tin to diamond-cubic grey tin below 13 C.'],
  [51,'Sb','Antimony',121.76,'metalloid','p',5,15,15,5,'Solid',133,2.05,834,6.697,903.78,1908,'rhombohedral',4.51,null,'Rhombohedral layered grey metalloid',null,'Brittle lustrous metalloid used in flame-retardant alloys, lead-acid batteries, and phase-change memory.'],
  [52,'Te','Tellurium',127.60,'metalloid','p',5,16,16,5,'Solid',123,2.10,869,6.24,722.66,1261,'hexagonal',4.46,5.93,'Hexagonal spiral chain metalloid',1782,'Rare silvery metalloid central to CdTe thin-film solar panels and thermoelectric coolers.'],
  [53,'I','Iodine',126.90,'reactive-nonmetal','p',5,17,17,5,'Solid',115,2.66,1008,4.933,386.85,457.4,'orthorhombic',7.27,9.79,'Orthorhombic molecular I2 crystal',1811,'Dark violet lustrous halogen that sublimes into purple vapor; vital for thyroid hormone synthesis.'],
  [54,'Xe','Xenon',131.29,'noble-gas','p',5,18,18,5,'Gas',108,2.60,1170,0.005894,161.40,165.03,'fcc',6.20,null,'Face-centered cubic solid xenon below 161 K',1898,'Dense noble gas powering spacecraft ion thrusters, medical anesthesia, and bright strobe lamps.'],
  [55,'Cs','Cesium',132.91,'alkali-metal','s',6,1,1,6,'Solid',298,0.79,376,1.93,301.7,944,'bcc',6.14,null,'Body-centered cubic golden alkali metal',1860,'Pale gold alkali metal with the lowest electronegativity among stable elements; defines the SI second.'],
  [56,'Ba','Barium',137.33,'alkaline-earth','s',6,2,2,6,'Solid',253,0.89,503,3.51,1000,2118,'bcc',5.02,null,'Body-centered cubic alkaline earth metal',1808,'Heavy reactive metal giving green fireworks their glow and enabling medical GI X-ray contrast.'],
  [57,'La','Lanthanum',138.91,'lanthanide','f',6,null,4,9,'Solid',195,1.10,538,6.162,1193,3737,'hcp',3.77,12.16,'Double hexagonal close-packed (DHCP)',1839,'Prototypical rare-earth metal used in high-refractive-index camera lenses and NiMH hybrid batteries.'],
  [58,'Ce','Cerium',140.12,'lanthanide','f',6,null,5,9,'Solid',185,1.12,534,6.770,1068,3716,'fcc',5.16,null,'Gamma-Ce face-centered cubic crystal',1803,'Most abundant lanthanide; sparks easily in lighter flints and polishes precision optical glass.'],
  [59,'Pr','Praseodymium',140.91,'lanthanide','f',6,null,6,9,'Solid',247,1.13,527,6.77,1208,3403,'hcp',3.67,11.83,'Double hexagonal close-packed lattice',1885,'Lanthanide yielding bright yellow-green glass-blower goggles and high-strength magnet alloys.'],
  [60,'Nd','Neodymium',144.24,'lanthanide','f',6,null,7,9,'Solid',206,1.14,533,7.01,1297,3347,'hcp',3.66,11.80,'Double hexagonal close-packed crystal',1885,'Heart of Nd2Fe14B — the strongest permanent magnets known, powering EV motors and wind turbines.'],
  [61,'Pm','Promethium',145,'lanthanide','f',6,null,8,9,'Solid',205,1.13,540,7.26,1315,3273,'hcp',3.65,11.65,'Double hexagonal close-packed radioactive rare earth',1945,'The only radioactive lanthanide with no stable isotopes; used in miniature betavoltaic nuclear batteries.'],
  [62,'Sm','Samarium',150.36,'lanthanide','f',6,null,9,9,'Solid',238,1.17,545,7.52,1345,2173,'rhombohedral',3.63,null,'9-layer rhombohedral close-packed lattice',1879,'Forms SmCo5 permanent magnets that retain magnetism at extreme temperatures where neodymium demagnetizes.'],
  [63,'Eu','Europium',151.96,'lanthanide','f',6,null,10,9,'Solid',231,1.20,547,5.264,1099,1802,'bcc',4.58,null,'Body-centered cubic divalent lanthanide',1901,'Most reactive lanthanide; provides the vivid red and blue phosphors in anti-counterfeit banknotes and LEDs.'],
  [64,'Gd','Gadolinium',157.25,'lanthanide','f',6,null,11,9,'Solid',233,1.20,593,7.90,1585,3546,'hcp',3.63,5.78,'Hexagonal close-packed ferromagnetic metal',1880,'Has 7 unpaired f-electrons making it strongly paramagnetic; premier MRI contrast agent and neutron shield.'],
  [65,'Tb','Terbium',158.93,'lanthanide','f',6,null,12,9,'Solid',225,1.10,566,8.23,1629,3396,'hcp',3.60,5.70,'Hexagonal close-packed metal',1843,'Lanthanide emitting crisp emerald-green fluorescence and enabling magnetostrictive Terfenol-D actuators.'],
  [66,'Dy','Dysprosium',162.50,'lanthanide','f',6,null,13,9,'Solid',228,1.22,573,8.540,1680,2840,'hcp',3.59,5.65,'Hexagonal close-packed magnetic lanthanide',1886,'Added to neodymium magnets to prevent demagnetization inside hot electric-vehicle traction motors.'],
  [67,'Ho','Holmium',164.93,'lanthanide','f',6,null,14,9,'Solid',226,1.23,581,8.79,1734,2873,'hcp',3.58,5.62,'Hexagonal close-packed lattice',1878,'Possesses the highest magnetic moment of any naturally occurring element, concentrating intense magnetic fields.'],
  [68,'Er','Erbium',167.26,'lanthanide','f',6,null,15,9,'Solid',226,1.24,589,9.066,1802,3141,'hcp',3.56,5.59,'Hexagonal close-packed rare-earth metal',1843,'Pink-ion lanthanide used in erbium-doped fiber amplifiers that boost global internet light signals.'],
  [69,'Tm','Thulium',168.93,'lanthanide','f',6,null,16,9,'Solid',222,1.25,597,9.32,1818,2223,'hcp',3.54,5.55,'Hexagonal close-packed crystal',1879,'Rarest non-radioactive lanthanide; powers portable X-ray sources and surgical solid-state lasers.'],
  [70,'Yb','Ytterbium',173.05,'lanthanide','f',6,null,17,9,'Solid',222,1.10,603,6.90,1097,1469,'fcc',5.48,null,'Face-centered cubic divalent lanthanide',1878,'Divalent lanthanide powering high-precision optical atomic clocks and high-power fiber lasers.'],
  [71,'Lu','Lutetium',174.97,'lanthanide','d',6,null,18,9,'Solid',217,1.27,524,9.841,1925,3675,'hcp',3.50,5.55,'Hexagonal close-packed densest lanthanide',1907,'Densest and hardest lanthanide; LYSO lutetium crystals serve as detectors in PET medical scanners.'],
  [72,'Hf','Hafnium',178.49,'transition-metal','d',6,4,4,6,'Solid',208,1.30,659,13.31,2506,4876,'hcp',3.20,5.05,'Hexagonal close-packed refractory metal',1923,'High-k HfO2 gate insulator enabled sub-45nm silicon transistors; strong neutron absorber in submarines.'],
  [73,'Ta','Tantalum',180.95,'transition-metal','d',6,5,5,6,'Solid',200,1.50,761,16.69,3290,5731,'bcc',3.30,null,'Body-centered cubic refractory metal',1802,'Exceptionally inert, biocompatible metal used in surgical implants and compact smartphone capacitors.'],
  [74,'W','Tungsten',183.84,'transition-metal','d',6,6,6,6,'Solid',193,2.36,770,19.25,3695,6203,'bcc',3.17,null,'Alpha-W body-centered cubic refractory metal',1783,'Highest melting point of all pure metals (3422 C); used in TIG electrodes, rocket nozzles, and X-ray targets.'],
  [75,'Re','Rhenium',186.21,'transition-metal','d',6,7,7,6,'Solid',188,1.90,760,21.02,3459,5869,'hcp',2.76,4.46,'Hexagonal close-packed superalloy metal',1925,'One of the rarest and densest metals; essential to single-crystal jet turbine blades operating at red heat.'],
  [76,'Os','Osmium',190.23,'transition-metal','d',6,8,8,6,'Solid',185,2.20,840,22.59,3306,5285,'hcp',2.73,4.32,'Hexagonal close-packed ultra-dense metal',1803,'Densest naturally occurring element on Earth (22.59 g/cm3); ultra-hard alloy used in fountain pen nibs.'],
  [77,'Ir','Iridium',192.22,'transition-metal','d',6,9,9,6,'Solid',180,2.20,880,22.56,2719,4403,'fcc',3.84,null,'Face-centered cubic corrosion-proof metal',1803,'Most corrosion-resistant metal known; its global clay layer marks the asteroid impact that ended the dinosaurs.'],
  [78,'Pt','Platinum',195.08,'transition-metal','d',6,10,10,6,'Solid',177,2.28,870,21.45,2041.4,4098,'fcc',3.92,null,'Face-centered cubic noble metal',1735,'Precious catalytic metal driving fuel cells, catalytic converters, chemotherapy drugs (cisplatin), and lab crucibles.'],
  [79,'Au','Gold',196.97,'transition-metal','d',6,11,11,6,'Solid',174,2.54,890,19.30,1337.33,3243,'fcc',4.08,null,'Face-centered cubic noble metal',null,'Relativistic electron effects give gold its warm yellow luster; infinitely malleable and non-tarnishing conductor.'],
  [80,'Hg','Mercury',200.59,'transition-metal','d',6,12,12,6,'Liquid',171,2.00,1007,13.534,234.32,629.88,'rhombohedral',3.01,null,'Alpha-Hg rhombohedral crystal below -38.8 C',null,'The only metal liquid at room temperature due to relativistic contraction of its 6s orbital.'],
  [81,'Tl','Thallium',204.38,'post-transition-metal','p',6,13,13,6,'Solid',156,1.62,589,11.85,577,1746,'hcp',3.46,5.52,'Alpha-Tl hexagonal close-packed soft metal',1861,'Soft heavy metal discovered via its bright green spectral line; used in specialized gamma scintillators.'],
  [82,'Pb','Lead',207.2,'post-transition-metal','p',6,14,14,6,'Solid',154,1.87,716,11.34,600.61,2022,'fcc',4.95,null,'Face-centered cubic dense ductile metal',null,'Dense, radiation-shielding post-transition metal representing the stable endpoint of major radioactive decay chains.'],
  [83,'Bi','Bismuth',208.98,'post-transition-metal','p',6,15,15,6,'Solid',143,2.02,703,9.78,544.7,1837,'rhombohedral',4.75,null,'Rhombohedral hopper-crystal lattice',1753,'Diamagnetic heavy metal forming iridescent staircase hopper crystals and low-toxicity lead substitutes.'],
  [84,'Po','Polonium',209,'post-transition-metal','p',6,16,16,6,'Solid',135,2.00,812,9.196,527,1235,'sc',3.35,null,'Alpha-Po simple cubic (only element with SC at STP)',1898,'Intensely alpha-radioactive chalcogen discovered by Marie and Pierre Curie; uniquely adopts a simple cubic lattice.'],
  [85,'At','Astatine',210,'metalloid','p',6,17,17,6,'Solid',127,2.20,899,8.91,575,610,'fcc',null,null,'Predicted FCC monatomic metallic phase under relativistic SOC',1940,'Rarest naturally occurring element in Earth crust; explored in targeted alpha-particle cancer radiotherapy.'],
  [86,'Rn','Radon',222,'noble-gas','p',6,18,18,6,'Gas',120,2.20,1037,0.00973,202,211.5,'fcc',null,null,'Predicted FCC solid radon below 202 K',1900,'Dense radioactive noble gas arising naturally from underground uranium and radium decay.'],
  [87,'Fr','Francium',223,'alkali-metal','s',7,1,1,7,'Solid',348,0.70,380,2.48,300,950,'bcc',null,null,'Predicted body-centered cubic alkali metal',1939,'Heaviest and most unstable alkali metal (22 min half-life), studied in magneto-optical traps for parity violation.'],
  [88,'Ra','Radium',226,'alkaline-earth','s',7,2,2,7,'Solid',283,0.90,509,5.50,973,2010,'bcc',5.15,null,'Body-centered cubic alkaline earth metal',1898,'Luminescent radioactive alkaline earth metal isolated from pitchblende ore by the Curies.'],
  [89,'Ac','Actinium',227,'actinide','f',7,null,4,10,'Solid',195,1.10,499,10.0,1323,3471,'fcc',5.31,null,'Face-centered cubic actinide crystal',1899,'Silvery radioactive metal glowing pale blue in the dark as its alpha particles ionize surrounding air.'],
  [90,'Th','Thorium',232.04,'actinide','f',7,null,5,10,'Solid',180,1.30,587,11.7,2115,5061,'fcc',5.08,null,'Face-centered cubic actinide metal',1828,'Weakly radioactive primordial metal far more abundant than uranium; promising fertile nuclear fuel.'],
  [91,'Pa','Protactinium',231.04,'actinide','f',7,null,6,10,'Solid',180,1.50,568,15.37,1841,4300,'tetragonal',3.93,3.24,'Body-centered tetragonal actinide lattice',1913,'Dense, scarce silvery actinide bridging thorium and uranium in natural decay chains.'],
  [92,'U','Uranium',238.03,'actinide','f',7,null,7,10,'Solid',175,1.38,598,19.1,1405.3,4404,'orthorhombic',2.85,4.96,'Alpha-U orthorhombic corrugated sheets',1789,'Dense primordial actinide powering nuclear fission reactors and radiometric geological dating.'],
  [93,'Np','Neptunium',237,'actinide','f',7,null,8,10,'Solid',175,1.36,605,20.45,917,4175,'orthorhombic',6.66,4.72,'Alpha-Np orthorhombic crystal',1940,'First synthetic transuranium element; exhibits five distinct valence oxidation states in solution.'],
  [94,'Pu','Plutonium',244,'actinide','f',7,null,9,10,'Solid',175,1.28,585,19.85,912.5,3501,'monoclinic',6.18,4.82,'Alpha-Pu low-symmetry monoclinic phase',1940,'Complex metal with six solid allotropes; Pu-238 powers deep-space RTGs on Voyager and Mars rovers.'],
  [95,'Am','Americium',243,'actinide','f',7,null,10,10,'Solid',175,1.30,578,12.0,1449,2880,'hcp',3.47,11.24,'Double hexagonal close-packed crystal',1944,'Synthetic actinide whose Am-241 isotope serves inside millions of household ionization smoke detectors.'],
  [96,'Cm','Curium',247,'actinide','f',7,null,11,10,'Solid',176,1.30,581,13.51,1613,3383,'hcp',3.50,11.33,'Double hexagonal close-packed crystal',1944,'Intensely radioactive actinide used in Mars rover Alpha Particle X-Ray Spectrometers (APXS).'],
  [97,'Bk','Berkelium',247,'actinide','f',7,null,12,10,'Solid',176,1.30,601,14.78,1259,2900,'hcp',3.42,11.07,'Double hexagonal close-packed lattice',1949,'Transuranium actinide synthesized in cyclotron experiments; critical target for making tennessine (Z=117).'],
  [98,'Cf','Californium',251,'actinide','f',7,null,13,10,'Solid',176,1.30,608,15.1,1173,1743,'hcp',3.39,11.01,'Double hexagonal close-packed crystal',1950,'Cf-252 is an extraordinarily intense neutron emitter used for reactor startup and mineral analysis.'],
  [99,'Es','Einsteinium',252,'actinide','f',7,null,14,10,'Solid',176,1.30,619,8.84,1133,1269,'fcc',5.75,null,'Face-centered cubic divalent-like metal',1952,'Discovered in 1952 thermonuclear test debris; so radioactive it glows blue and damages its own lattice.'],
  [100,'Fm','Fermium',257,'actinide','f',7,null,15,10,'Synthetic',176,1.30,627,9.7,1800,null,'fcc',null,null,'Predicted FCC divalent actinide crystal',1952,'Heaviest element reachable purely via neutron bombardment of lighter elements without particle accelerators.'],
  [101,'Md','Mendelevium',258,'actinide','f',7,null,16,10,'Synthetic',176,1.30,635,10.3,1100,null,'fcc',null,null,'Predicted FCC metallic phase',1955,'Named for Dmitri Mendeleev; synthesized atom-by-atom via alpha bombardment of einsteinium.'],
  [102,'No','Nobelium',259,'actinide','f',7,null,17,10,'Synthetic',176,1.30,642,9.9,1100,null,'fcc',null,null,'Predicted FCC divalent metal',1958,'Exhibits an unusually stable +2 oxidation state in aqueous chemistry due to a filled 5f14 shell.'],
  [103,'Lr','Lawrencium',266,'actinide','d',7,null,18,10,'Synthetic',176,1.30,470,15.6,1900,null,'hcp',null,null,'Predicted HCP trivalent heavy metal',1961,'Final actinide; relativistic effects place its outermost electron in 7p1 rather than 6d1.'],
  [104,'Rf','Rutherfordium',267,'transition-metal','d',7,4,4,7,'Synthetic',157,null,580,23.2,2400,5800,'hcp',null,null,'Predicted HCP transactinide metal',1964,'First transactinide superheavy element, chemically resembling hafnium and zirconium.'],
  [105,'Db','Dubnium',268,'transition-metal','d',7,5,5,7,'Synthetic',149,null,665,29.3,null,null,'bcc',null,null,'Predicted BCC group-5 superheavy metal',1968,'Synthetic group-5 metal named after the Joint Institute for Nuclear Research in Dubna.'],
  [106,'Sg','Seaborgium',269,'transition-metal','d',7,6,6,7,'Synthetic',143,null,757,35.0,null,null,'bcc',null,null,'Predicted BCC group-6 superheavy metal',1974,'Forms volatile hexacarbonyl Sg(CO)6 in gas-phase experiments just like molybdenum and tungsten.'],
  [107,'Bh','Bohrium',270,'transition-metal','d',7,7,7,7,'Synthetic',141,null,740,37.1,null,null,'hcp',null,null,'Predicted HCP group-7 metal',1981,'Superheavy group-7 element named after atomic pioneer Niels Bohr; forms volatile oxychloride BhO3Cl.'],
  [108,'Hs','Hassium',277,'transition-metal','d',7,8,8,7,'Synthetic',134,null,730,40.7,null,null,'hcp',null,null,'Predicted HCP ultra-dense superheavy metal',1984,'Forms volatile tetroxide HsO4 confirming its group-8 kinship with osmium despite extreme nuclear mass.'],
  [109,'Mt','Meitnerium',278,'unknown','d',7,9,9,7,'Synthetic',129,null,800,37.4,null,null,'fcc',null,null,'Predicted FCC group-9 element',1982,'Named to honor nuclear fission pioneer Lise Meitner; studied solely via single-atom decay chains.'],
  [110,'Ds','Darmstadtium',281,'unknown','d',7,10,10,7,'Synthetic',128,null,960,34.8,null,null,'bcc',null,null,'Predicted BCC/FCC group-10 superheavy metal',1994,'Created by fusing nickel and lead nuclei in Darmstadt, Germany.'],
  [111,'Rg','Roentgenium',282,'unknown','d',7,11,11,7,'Synthetic',121,null,1020,28.7,null,null,'bcc',null,null,'Predicted BCC relativistic coinage homolog',1994,'Named for X-ray discoverer Wilhelm Rontgen; relativistic shifts likely alter its color from gold.'],
  [112,'Cn','Copernicium',285,'unknown','d',7,12,12,7,'Synthetic',122,null,1155,14.0,283,340,'hcp',null,null,'Predicted volatile liquid/gas-like group-12 element',1996,'Relativistic contraction of its 7s shell makes copernicium unusually volatile, even noble-gas-like.'],
  [113,'Nh','Nihonium',286,'unknown','p',7,13,13,7,'Synthetic',136,null,705,16.0,700,1400,'hcp',null,null,'Predicted HCP post-transition element',2004,'First element discovered in Asia (RIKEN, Japan), named after Nihon (Land of the Rising Sun).'],
  [114,'Fl','Flerovium',289,'unknown','p',7,14,14,7,'Synthetic',143,null,832,9.9,200,380,'fcc',null,null,'Predicted FCC quasi-noble volatile metal',1998,'Near the theoretical Island of Stability (Z=114), showing surprisingly weak metallic bonding.'],
  [115,'Mc','Moscovium',290,'unknown','p',7,15,15,7,'Synthetic',162,null,538,13.5,670,1400,'fcc',null,null,'Predicted dense heavy pnictogen crystal',2003,'Superheavy group-15 element decaying rapidly into nihonium via alpha emission.'],
  [116,'Lv','Livermorium',293,'unknown','p',7,16,16,7,'Synthetic',175,null,664,12.9,709,1085,'orthorhombic',null,null,'Predicted heavy chalcogen solid',2000,'Synthesized at Dubna with Lawrence Livermore National Laboratory using Ca-48 beams on curium-248.'],
  [117,'Ts','Tennessine',294,'unknown','p',7,17,17,7,'Synthetic',165,null,742,7.2,723,883,'fcc',null,null,'Predicted metalloid-like heavy halogen',2010,'Second-heaviest known element; spin-orbit coupling likely suppresses classic halogen reactivity.'],
  [118,'Og','Oganesson',294,'unknown','p',7,18,18,7,'Synthetic',157,null,860,7.2,325,450,'fcc',null,null,'Predicted semiconductor solid at room temp (relativistic)',2002,'Heaviest known element (Z=118); relativistic shell effects may make this "noble gas" a polarizable solid.']
];

export const ELEMENTS = RAW_ELEMENTS.map((item) => {
  const [
    z, symbol, name, mass, category, block, period, group, col, row,
    phase, radius, electronegativity, ionization, density, melt, boil,
    crystalType, a, c, crystalNote, year, summary
  ] = item;

  const { subshells, shells, electronConfig, nobleConfig } = computeElectrons(z);
  const neutrons = Math.max(0, Math.round(mass) - z);

  return {
    z,
    symbol,
    name,
    mass,
    neutrons,
    category,
    block,
    period,
    group,
    col,
    row,
    phase,
    radius,
    electronegativity,
    ionization,
    density,
    melt,
    boil,
    crystal: {
      type: crystalType,
      a,
      c,
      note: crystalNote
    },
    year,
    summary,
    shells,
    subshells,
    electronConfig,
    nobleConfig
  };
});

export const ELEMENTS_BY_Z = new Map(ELEMENTS.map((el) => [el.z, el]));
export const ELEMENTS_BY_SYMBOL = new Map(ELEMENTS.map((el) => [el.symbol.toLowerCase(), el]));

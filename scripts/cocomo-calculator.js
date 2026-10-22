/**
 * COCOMO & Halstead Metrics CLI Calculator
 * Practical 10 - SE Lab : BTCS502 / Advanced Web Technology
 */

console.log('\n================================================================================');
console.log('         INOVIQ — SOFTWARE ESTIMATION & COMPLEXITY ANALYSIS REPORT              ');
console.log('         COCOMO (Basic, Intermediate, Detailed) & Halstead Metrics             ');
console.log('================================================================================\n');

// 1. Codebase Sizing
const sizing = [
  { part: 'Client HTML (pages)', files: 8, lines: 3553, kloc: 3.55 },
  { part: 'Client CSS (styles)', files: 6, lines: 3929, kloc: 3.93 },
  { part: 'Client JavaScript (app.js: controllers/services)', files: 1, lines: 1829, kloc: 1.83 },
  { part: 'Server JavaScript (routes, models, utils)', files: 13, lines: 1028, kloc: 1.03 }
];

const totalFiles = sizing.reduce((acc, cur) => acc + cur.files, 0);
const totalLines = sizing.reduce((acc, cur) => acc + cur.lines, 0);
const totalKLOC = +(sizing.reduce((acc, cur) => acc + cur.kloc, 0)).toFixed(2);

console.log('--- 1. PROJECT SIZING BREAKDOWN ---');
console.table(sizing);
console.log(`Total Hand-written Source: ${totalFiles} files, ${totalLines} code lines (${totalKLOC} KLOC)`);
console.log('(Note: 12 Jest test files (767 lines), node_modules, and configs are excluded from product size)\n');

// 2. Basic COCOMO
console.log('--- 2. BASIC COCOMO MODEL ESTIMATION ---');
console.log('Formula: Effort = a * (KLOC)^b [Person-Months], Time = c * (Effort)^d [Months]');

const basicModes = {
  Organic: { a: 2.4, b: 1.05, c: 2.5, d: 0.38 },
  'Semi-detached': { a: 3.0, b: 1.12, c: 2.5, d: 0.35 },
  Embedded: { a: 3.6, b: 1.20, c: 2.5, d: 0.32 }
};

const basicResults = [];
for (const [mode, p] of Object.entries(basicModes)) {
  const effort = p.a * Math.pow(totalKLOC, p.b);
  const time = p.c * Math.pow(effort, p.d);
  const staff = effort / time;
  basicResults.push({
    Mode: mode,
    'a / b / c / d': `${p.a} / ${p.b} / ${p.c} / ${p.d}`,
    'Effort (PM)': effort.toFixed(1),
    'Schedule (Months)': time.toFixed(1),
    'Avg Staff': staff.toFixed(1)
  });
}
console.table(basicResults);

// Size sensitivity
const bases = [
  { Basis: 'All code (HTML + CSS + JS)', KLOC: 10.34, Effort_PM: (2.4 * Math.pow(10.34, 1.05)).toFixed(1), Time_Months: (2.5 * Math.pow(2.4 * Math.pow(10.34, 1.05), 0.38)).toFixed(1) },
  { Basis: 'HTML + JS only (no CSS)', KLOC: 6.41, Effort_PM: (2.4 * Math.pow(6.41, 1.05)).toFixed(1), Time_Months: (2.5 * Math.pow(2.4 * Math.pow(6.41, 1.05), 0.38)).toFixed(1) },
  { Basis: 'JS logic only', KLOC: 2.86, Effort_PM: (2.4 * Math.pow(2.86, 1.05)).toFixed(1), Time_Months: (2.5 * Math.pow(2.4 * Math.pow(2.86, 1.05), 0.38)).toFixed(1) }
];
console.log('Sensitivity by Code Category (Organic Mode):');
console.table(bases);

// 3. Intermediate COCOMO
console.log('\n--- 3. INTERMEDIATE COCOMO ESTIMATION ---');
console.log('Formula: Effort = a * (KLOC)^b * EAF, where a = 3.2 for Organic Mode');
const drivers = [
  { Driver: 'RELY (Required Software Reliability)', Rating: 'Low', Multiplier: 0.88, Reason: 'Academic project; non-safety critical' },
  { Driver: 'AEXP (Application Experience)', Rating: 'Low', Multiplier: 1.13, Reason: 'First full-stack digital card & OCR web app' },
  { Driver: 'LEXP (Programming Language Experience)', Rating: 'Low', Multiplier: 1.07, Reason: 'Team learning asynchronous Node and AngularJS' },
  { Driver: 'TOOL (Use of Software Tools)', Rating: 'High', Multiplier: 0.91, Reason: 'VS Code, Git, Jest CLI, Postman, MongoDB Compass' },
  { Driver: 'All other 11 Cost Drivers', Rating: 'Nominal', Multiplier: 1.00, Reason: 'Standard conditions / no deviation' }
];
console.table(drivers);

const eaf = +(0.88 * 1.13 * 1.07 * 0.91).toFixed(2);
const nominalEffort = 3.2 * Math.pow(totalKLOC, 1.05);
const adjustedEffort = nominalEffort * eaf;
const intermediateTime = 2.5 * Math.pow(adjustedEffort, 0.38);
const intermediateStaff = adjustedEffort / intermediateTime;

console.log(`Effort Adjustment Factor (EAF) = 0.88 * 1.13 * 1.07 * 0.91 = ${eaf}`);
console.log(`Nominal Effort = 3.2 * (10.34)^1.05 = ${nominalEffort.toFixed(1)} Person-Months`);
console.log(`Adjusted Effort = ${nominalEffort.toFixed(1)} * ${eaf} = ${adjustedEffort.toFixed(1)} Person-Months`);
console.log(`Development Time = 2.5 * (${adjustedEffort.toFixed(1)})^0.38 = ${intermediateTime.toFixed(1)} Months`);
console.log(`Average Staff Required = ${intermediateStaff.toFixed(1)} Persons\n`);

// 4. Complete (Detailed) COCOMO
console.log('--- 4. COMPLETE (DETAILED) COCOMO SUBSYSTEM ESTIMATION ---');
const components = [
  { Component: 'Frontend UI (HTML + CSS)', KLOC: 7.48, 'Drivers Applied': 'TOOL high, AEXP low', EAF: 1.03, Effort_PM: 27.2 },
  { Component: 'Frontend Logic (AngularJS app.js)', KLOC: 1.83, 'Drivers Applied': 'CPLX high, RELY low, AEXP low, LEXP low, TOOL high', EAF: 1.11, Effort_PM: 6.7 },
  { Component: 'Backend (Express, Mongoose, JWT, Cards)', KLOC: 1.03, 'Drivers Applied': 'RELY high, AEXP low, LEXP low, TOOL high', EAF: 1.27, Effort_PM: 4.2 }
];
console.table(components);
const totalDetailedEffort = components.reduce((acc, c) => acc + c.Effort_PM, 0);
const detailedTime = 2.5 * Math.pow(totalDetailedEffort, 0.38);
console.log(`Total Detailed Effort = ${totalDetailedEffort.toFixed(1)} Person-Months`);
console.log(`Total Development Time = 2.5 * (${totalDetailedEffort.toFixed(1)})^0.38 = ${detailedTime.toFixed(1)} Months`);
console.log(`Average Staff = ${(totalDetailedEffort / detailedTime).toFixed(1)} Persons\n`);

// 5. Halstead Complexity Metrics
console.log('--- 5. HALSTEAD COMPLEXITY METRICS ---');
const halstead = [
  { Metric: 'n1 (distinct operators)', 'auth.js (server)': 26, 'app.js (client)': 38, 'All JavaScript (14 files)': 46 },
  { Metric: 'n2 (distinct operands)', 'auth.js (server)': 114, 'app.js (client)': 1057, 'All JavaScript (14 files)': 1506 },
  { Metric: 'N1 (total operators)', 'auth.js (server)': 834, 'app.js (client)': 7944, 'All JavaScript (14 files)': 12173 },
  { Metric: 'N2 (total operands)', 'auth.js (server)': 477, 'app.js (client)': 4836, 'All JavaScript (14 files)': 7287 },
  { Metric: 'Vocabulary n = n1 + n2', 'auth.js (server)': 140, 'app.js (client)': 1095, 'All JavaScript (14 files)': 1552 },
  { Metric: 'Length N = N1 + N2', 'auth.js (server)': 1311, 'app.js (client)': 12780, 'All JavaScript (14 files)': 19460 },
  { Metric: 'Volume V = N * log2(n)', 'auth.js (server)': '9,346', 'app.js (client)': '129,036', 'All JavaScript (14 files)': '206,274' },
  { Metric: 'Difficulty D = (n1/2)*(N2/n2)', 'auth.js (server)': '54.4', 'app.js (client)': '86.9', 'All JavaScript (14 files)': '111.3' },
  { Metric: 'Effort E = D * V', 'auth.js (server)': '508,400', 'app.js (client)': '11,216,978', 'All JavaScript (14 files)': '22,956,029' },
  { Metric: 'Time T = E / 18 sec', 'auth.js (server)': '28,244 s (~7.8 h)', 'app.js (client)': '623,165 s (~173 h)', 'All JavaScript (14 files)': '~354 hours' },
  { Metric: 'Estimated Bugs B = V / 3000', 'auth.js (server)': '3.1', 'app.js (client)': '43.0', 'All JavaScript (14 files)': '68.8' }
];
console.table(halstead);

// 6. Estimated vs Actual Comparison
console.log('--- 6. ESTIMATED VS ACTUAL COMPARISON ---');
const comparison = [
  { Model: 'Basic COCOMO (10.34 KLOC)', 'Effort (PM)': 27.9, 'Time (Months)': 8.9, 'Effort vs Actual': '2.3x' },
  { Model: 'Basic COCOMO (HTML + JS, 6.41 KLOC)', 'Effort (PM)': 16.9, 'Time (Months)': 7.3, 'Effort vs Actual': '1.4x' },
  { Model: 'Intermediate COCOMO', 'Effort (PM)': 36.0, 'Time (Months)': 9.8, 'Effort vs Actual': '3.0x' },
  { Model: 'Complete (Detailed) COCOMO', 'Effort (PM)': 38.1, 'Time (Months)': 10.0, 'Effort vs Actual': '3.2x' },
  { Model: 'Actual Team Effort (Upper Bound)', 'Effort (PM)': 12.0, 'Time (Months)': 3.0, 'Effort vs Actual': '1.0x (4 members x 3 mos)' }
];
console.table(comparison);

console.log('================================================================================\n');

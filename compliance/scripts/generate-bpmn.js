#!/usr/bin/env node
/**
 * Simple BPMN XML generator from JSON spec at src/models/BPMN/compliance-processes.json
 * No external deps; creates minimal BPMN (no DI diagram). Modelers can auto-layout.
 */
import fs from 'fs';
import process from 'node:process';
import path from 'path';

const jsonPath = path.resolve(process.cwd(), 'src', 'models', 'BPMN', 'compliance-processes.json');
const outDir = path.resolve(process.cwd(), 'src', 'models', 'BPMN', 'xml');

if (!fs.existsSync(jsonPath)) {
  console.error('Spec not found:', jsonPath);
  process.exit(1);
}
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const spec = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

function slug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function idize(prefix, name) {
  return prefix + '_' + slug(name).replace(/-/g, '_');
}

function buildProcessXML(proc) {
  const pName = proc.process.name;
  const pId = idize('process', pName);
  const lines = []; // collect XML lines

  // Collect elements
  const startEvents = proc.events.start.map(ev => ({ type: 'startEvent', id: idize('start', ev.name), name: ev.name }));
  const endEvents = proc.events.end.map(ev => ({ type: 'endEvent', id: idize('end', ev.name), name: ev.name }));
  const tasks = (proc.activities.tasks || []).map(t => ({ type: 'task', id: idize('task', t.name), name: t.name }));
  const gateways = []; // exclusive only
  (proc.gateways.exclusive || []).forEach((gw, idx) => {
    gateways.push({ type: 'exclusiveGateway', id: idize('gw', gw.name + '_' + idx), name: gw.name, branches: gw.branches });
  });

  // Map name->id for sequence flow resolution
  const nameToId = {};
  [...startEvents, ...endEvents, ...tasks, ...gateways].forEach(el => { nameToId[el.name] = el.id; });

  // Build sequence flows from simple "A → B" strings
  const sequenceFlows = [];
  (proc.flows.sequence || []).forEach((raw, idx) => {
    const parts = raw.split('→').map(s => s.trim());
    if (parts.length !== 2) return;
    let source = parts[0];
    let target = parts[1];
    // Handle branches like "Authorized? (Yes)" by extracting element and condition
    let condition = null;
    const branchMatch = source.match(/^(.*)?\((.*)\)$/);
    if (branchMatch) {
      source = branchMatch[1].trim();
      condition = branchMatch[2].trim();
    }
    const branchMatchTarget = target.match(/^(.*)?\((.*)\)$/);
    if (branchMatchTarget) {
      target = branchMatchTarget[1].trim();
      // Typically target condition is not required; ignore second part
    }
    const sId = nameToId[source];
    const tId = nameToId[target];
    if (!sId || !tId) {
      sequenceFlows.push({ warning: 'Unresolved flow: ' + raw });
      return;
    }
    sequenceFlows.push({ id: 'flow_' + idx, sourceRef: sId, targetRef: tId, condition });
  });

  // XML header & definitions
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"');
  lines.push('                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');
  lines.push('                 id="defs_' + pId + '" targetNamespace="http://example.com/bpmn">');
  lines.push(`  <bpmn:process id="${pId}" name="${escapeXml(pName)}" isExecutable="false">`);

  startEvents.forEach(ev => lines.push(`    <bpmn:startEvent id="${ev.id}" name="${escapeXml(ev.name)}" />`));
  endEvents.forEach(ev => lines.push(`    <bpmn:endEvent id="${ev.id}" name="${escapeXml(ev.name)}" />`));
  tasks.forEach(t => lines.push(`    <bpmn:task id="${t.id}" name="${escapeXml(t.name)}" />`));
  gateways.forEach(gw => lines.push(`    <bpmn:exclusiveGateway id="${gw.id}" name="${escapeXml(gw.name)}" />`));

  sequenceFlows.forEach(fl => {
    if (fl.warning) {
      lines.push(`    <!-- ${escapeXml(fl.warning)} -->`);
      return;
    }
    if (fl.condition) {
      lines.push(`    <bpmn:sequenceFlow id="${fl.id}" sourceRef="${fl.sourceRef}" targetRef="${fl.targetRef}">`);
      lines.push(`      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">${escapeXml(fl.condition)}</bpmn:conditionExpression>`);
      lines.push('    </bpmn:sequenceFlow>');
    } else {
      lines.push(`    <bpmn:sequenceFlow id="${fl.id}" sourceRef="${fl.sourceRef}" targetRef="${fl.targetRef}" />`);
    }
  });

  lines.push('  </bpmn:process>');
  lines.push('</bpmn:definitions>');
  return lines.join('\n');
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

if (!Array.isArray(spec.processes)) {
  console.error('Invalid spec: missing processes[]');
  process.exit(1);
}

const manifest = [];

spec.processes.forEach(proc => {
  const xml = buildProcessXML(proc);
  const fileName = slug(proc.process.name) + '.bpmn';
  const filePath = path.join(outDir, fileName);
  fs.writeFileSync(filePath, xml, 'utf-8');
  manifest.push(fileName);
});

const manifestPath = path.join(outDir, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify({ generated: new Date().toISOString(), files: manifest }, null, 2));

console.log('Generated BPMN files:', manifest.join(', '));
console.log('Output directory:', outDir);
console.log('Done.');

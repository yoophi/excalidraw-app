import { f as flowDb, p as parser$1 } from "./flowDb-956e92f1-Bqj3wkNI.js";
import { f as flowStyles, a as flowRendererV2 } from "./styles-c10674c1-rP5vu1e6.js";
import { x as setConfig } from "./index-TZwSmFf6.js";
import "./graph-bDTmQmqW.js";
import "./layout-DRC6YBZ6.js";
import "./index-vrl53rc3.js";
import "./index-3862675e-SqOMxqTI.js";
import "./clone-DlrLS08g.js";
import "./edges-e0da2a9e-C0ZymVIQ.js";
import "./createText-2e5e7dd3-QEawxb0G.js";
import "./line-U_r1HU_w.js";
import "./array-DgktLKBx.js";
import "./path-Cp2qmpkd.js";
import "./channel-DBsPTYaG.js";
const diagram = {
  parser: parser$1,
  db: flowDb,
  renderer: flowRendererV2,
  styles: flowStyles,
  init: (cnf) => {
    if (!cnf.flowchart) {
      cnf.flowchart = {};
    }
    cnf.flowchart.arrowMarkerAbsolute = cnf.arrowMarkerAbsolute;
    setConfig({ flowchart: { arrowMarkerAbsolute: cnf.arrowMarkerAbsolute } });
    flowRendererV2.setConf(cnf.flowchart);
    flowDb.clear();
    flowDb.setGen("gen-2");
  }
};
export {
  diagram
};

import Vue from "vue"; 
import BpmnModel from "./components/bpmn-v.0.0.1/BPMN.vue";
const Components = { BpmnModel};
Object.keys(Components).forEach(name => { 
  Vue.component(name, Components[name]);
});
export default Components;
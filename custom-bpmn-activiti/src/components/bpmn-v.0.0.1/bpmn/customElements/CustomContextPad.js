//该js用于控制自定义元素的后续可新增的元素
const SUITABILITY_SCORE_HIGH = 100,
      SUITABILITY_SCORE_AVERGE = 50,
      SUITABILITY_SCORE_LOW = 25;

import Vue from 'vue';//runtime模式
import FormModal from './components/formModal.vue';

var is = require('bpmn-js/lib/util/ModelUtil').is;


export default class CustomContextPad {
  constructor(bpmnFactory, config, contextPad, create, elementFactory, injector, translate) {
    this.bpmnFactory = bpmnFactory;
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;

    if (config.autoPlace !== false) {
      this.autoPlace = injector.get('autoPlace', false);
    }

    contextPad.registerProvider(this);
  }

  getContextPadEntries(element) {
    const {
      autoPlace,
      bpmnFactory,
      create,
      elementFactory,
      translate
    } = this;

    function appendServiceTask(suitabilityScore) {
      return function(event, element) {
        if (autoPlace) {
          const businessObject = bpmnFactory.create('bpmn:Task');
    
          businessObject.suitable = suitabilityScore;
    
          const shape = elementFactory.createShape({
            type: 'bpmn:Task',
            businessObject: businessObject
          });
    
          autoPlace.append(element, shape);
        } else {
          appendServiceTaskStart(event, element);
        }
      }
    }
		
    function appendServiceTaskStart(suitabilityScore) {
      return function(event) {
        const businessObject = bpmnFactory.create('bpmn:Task');

        businessObject.suitable = suitabilityScore;

        const shape = elementFactory.createShape({
          type: 'bpmn:Task',
          businessObject: businessObject
        });

        create.start(event, shape, element);
      }
    }
		
		// 添加自定义表单配置
		function appendCustomFormConfiguration(suitabilityScore) {
		  return function(event, element) {
		    console.log(event,element);
				console.log(this.common)
				// this.$emit('communicationEvent01',element,'getBusinessObject');// 右击自定义表单配置
		    // let self = this
		    // var app = document.getElementsByClassName('BPMN')[0];
		    // var div = document.createElement('div');
		    // div.className = "costom-form";
		    // div.id = "costom-form";
		    // app.appendChild(div);
		    // 
		    // let FormModalCom = (this.FormModalCom = new Vue({
		    //   render: function(createElement) { 
		    //     let props = {};
		    //     props.id = element.id;
		    //     props.element = element;
		    //     return createElement(FormModal, {props});
		    //   }
		    // }).$mount('#costom-form'))
		  }
		}
		
    // 只有用户任务才能添加或编辑表单配置
    function ensureFormKeyAndDataSupported(element) {
			
      // return (
      //   is(element, 'bpmn:StartEvent') && !is(element.parent, 'bpmn:SubProcess')
      // ) || is(element, 'bpmn:UserTask');
			
			return is(element, 'bpmn:UserTask');
    }
    if (!ensureFormKeyAndDataSupported(element)) {
      return;
    }

    return {
      'append.custom-form-configuration': {
        group: 'model',
        className: 'bpmn-icon-task red',
        title: '表单配置',
        action: {
          click: appendCustomFormConfiguration(SUITABILITY_SCORE_LOW),
          // dragstart: appendServiceTaskStart(SUITABILITY_SCORE_LOW)
        }
      },
      // 'append.average-task': {
      //   group: 'model',
      //   className: 'bpmn-icon-task yellow',
      //   title: translate('Append Task with average suitability score'),
      //   action: {
      //     click: appendServiceTask(SUITABILITY_SCORE_AVERGE),
      //     dragstart: appendServiceTaskStart(SUITABILITY_SCORE_AVERGE)
      //   }
      // },
      // 'append.high-task': {
      //   group: 'model',
      //   className: 'bpmn-icon-task green',
      //   title: translate('Append Task with high suitability score'),
      //   action: {
      //     click: appendServiceTask(SUITABILITY_SCORE_HIGH),
      //     dragstart: appendServiceTaskStart(SUITABILITY_SCORE_HIGH)
      //   }
      // }
    };
  }
}

CustomContextPad.$inject = [
  'bpmnFactory',
  'config',
  'contextPad',
  'create',
  'elementFactory',
  'injector',
  'translate'
];
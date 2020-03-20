'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    is = require('bpmn-js/lib/util/ModelUtil').is,
    asyncContinuation = require('./implementation/AsyncContinuation').default.function;

export default{ function(group, element, bpmnFactory, translate) {

  if (is(element, 'activiti:AsyncCapable')) {

    group.entries = group.entries.concat(asyncContinuation(element, bpmnFactory, {
      getBusinessObject: getBusinessObject
    }, translate));

  }
}};
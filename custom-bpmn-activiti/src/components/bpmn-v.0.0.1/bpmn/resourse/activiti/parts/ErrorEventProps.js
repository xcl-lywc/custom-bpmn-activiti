'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
    eventDefinitionHelper = require('bpmn-js-properties-panel/lib/helper/EventDefinitionHelper'),
    error = require('./implementation/ErrorEventDefinition').default.function;

var forEach = require('lodash/forEach');


export default{ function(group, element, bpmnFactory, translate) {

  var errorEvents = [
    'bpmn:StartEvent',
    'bpmn:BoundaryEvent',
    'bpmn:EndEvent'
  ];

  forEach(errorEvents, function(event) {
    if (is(element, event)) {

      var errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(element);

      if (errorEventDefinition) {
        var isCatchingErrorEvent = is(element, 'bpmn:StartEvent') || is (element, 'bpmn:BoundaryEvent');

        var showErrorCodeVariable = isCatchingErrorEvent,
            showErrorMessageVariable = isCatchingErrorEvent;

        error(
          group,
          element,
          bpmnFactory,
          errorEventDefinition,
          showErrorCodeVariable,
          showErrorMessageVariable,
          translate);
      }
    }
  });
}};

'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

export default{ function(element, bpmnFactory, options, translate) {

  var getBusinessObject = options.getBusinessObject;

  var jobPriorityEntry = entryFactory.textField({
    id: 'jobPriority',
    label: translate('Job Priority'),
    modelProperty: 'jobPriority',

    get: function(element, node) {
      var bo = getBusinessObject(element);
      return {
        jobPriority: bo.get('activiti:jobPriority')
      };
    },

    set: function(element, values) {
      var bo = getBusinessObject(element);
      return cmdHelper.updateBusinessObject(element, bo, {
        'activiti:jobPriority': values.jobPriority || undefined
      });
    }

  });

  return [ jobPriorityEntry ];

}};

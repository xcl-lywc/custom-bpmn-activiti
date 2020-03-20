'use strict';

var listener = require('./implementation/Listener').default.function;

export default{ function(group, element, bpmnFactory, translate) {

  var listenerEntry = listener(element, bpmnFactory, {}, translate);

  group.entries = group.entries.concat(listenerEntry.entries);

  return {
    getSelectedListener: listenerEntry.getSelectedListener
  };

}};

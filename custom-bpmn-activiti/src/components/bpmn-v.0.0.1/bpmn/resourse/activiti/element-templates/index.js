module.exports = {
  __depends__: [
    require('./cmd'),
    require('diagram-js/lib/i18n/translate').default
  ],
  __init__: [
    'customElementsPropertiesActivator',
    'elementTemplatesLoader'
  ],
  customElementsPropertiesActivator: [ 'type', require('./CustomElementsPropertiesActivator').default ],
  elementTemplates: [ 'type', require('./ElementTemplates').default ],
  elementTemplatesLoader: [ 'type', require('./ElementTemplatesLoader').default ]
};

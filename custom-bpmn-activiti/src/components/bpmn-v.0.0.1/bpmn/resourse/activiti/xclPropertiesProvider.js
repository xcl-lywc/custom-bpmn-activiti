'use strict';

// 相关文件的引入 ============================================================
var inherits = require('inherits');

var PropertiesActivator = require('bpmn-js-properties-panel/lib/PropertiesActivator.js');

var asyncCapableHelper = require('bpmn-js-properties-panel/lib/helper/AsyncCapableHelper'),
    ImplementationTypeHelper = require('bpmn-js-properties-panel/lib/helper/ImplementationTypeHelper');

var is = require('bpmn-js/lib/util/ModelUtil').is;

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    eventDefinitionHelper = require('bpmn-js-properties-panel/lib/helper/EventDefinitionHelper'),
    implementationTypeHelper = require('bpmn-js-properties-panel/lib/helper/ImplementationTypeHelper');

// bpmn的相关属性 ============================================================

// 基本属性 
var processProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/ProcessProps'),// 进程
    eventProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/EventProps'),// event
    linkProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/LinkProps'),// link
    documentationProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/DocumentationProps'),// 文档
    idProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/IdProps'),// id
    nameProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/NameProps'),// name
    executableProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/ExecutableProps');// 可执行性

// activiti的相关属性 ============================================================

// 基本属性 
var versionTag = require('./parts/VersionTagProps').default.function,// 版本号
    userTaskProps = require('./parts/UserTaskProps').default.function,// 用户任务
    formProps = require('./parts/FormProps').default.function,// 表单
    serviceTaskDelegateProps = require('./parts/ServiceTaskDelegateProps').default.function,// 服务任务委托
    asynchronousContinuationProps = require('./parts/AsynchronousContinuationProps').default.function,// 异步延续
    callActivityProps = require('./parts/CallActivityProps').default.function,// 调用活动
    multiInstanceProps = require('./parts/MultiInstanceLoopProps').default.function,// 多实例
    conditionalProps = require('./parts/ConditionalProps').default.function,// 条件
    scriptProps = require('./parts/ScriptTaskProps').default.function,// 脚本任务
    errorProps = require('./parts/ErrorEventProps').default.function,// error
    startEventInitiator = require('./parts/StartEventInitiator').default.function;// 开始事件的发起者
    // variableMapping = require('./parts/VariableMappingProps');

// 监听器
var listenerProps = require('./parts/ListenerProps').default.function,// 监听
    listenerDetails = require('./parts/ListenerDetailProps').default.function,// 监听详情
    listenerFields = require('./parts/ListenerFieldInjectionProps').default.function;// 监听字段

// 元素组件
var elementTemplateChooserProps = require('./element-templates/parts/ChooserProps').default.function,// 元素组件
    elementTemplateCustomProps = require('./element-templates/parts/CustomProps').default.returnGroups;// 元素组件的自定义

// 作业配置
var jobConfiguration = require('./parts/JobConfigurationProps').default.function;

// 历史活动时间
var historyTimeToLive = require('./parts/HistoryTimeToLiveProps').default.function;

// 候选启动组/用户
var candidateStarter = require('./parts/CandidateStarterProps').default.function;

// 任务列表
var tasklist = require('./parts/TasklistProps').default.function;

// 外部任务配置
var externalTaskConfiguration = require('./parts/ExternalTaskConfigurationProps').default.function;

// 辅助定义、函数、方法 ============================================================

// 是否启用作业配置
var isJobConfigEnabled = function(element) {
  var businessObject = getBusinessObject(element);

  if (is(element, 'bpmn:Process') || is(element, 'bpmn:Participant') && businessObject.get('processRef')) {
    return true;
  }

  // 异步行为
  var bo = getBusinessObject(element);
  if (asyncCapableHelper.isAsyncBefore(bo) || asyncCapableHelper.isAsyncAfter(bo)) {
    return true;
  }

  // 计时器定义
  if (is(element, 'bpmn:Event')) {
    return !!eventDefinitionHelper.getTimerEventDefinition(element);
  }

  return false;
};

// 是否启用外部任务配置
var isExternalTaskPriorityEnabled = function(element) {
  var businessObject = getBusinessObject(element);

  // 仅当元素是进程、参与者时才显示。。。
  if (is(element, 'bpmn:Process') || is(element, 'bpmn:Participant') && businessObject.get('processRef')) {
    return true;
  }

  var externalBo = ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element),
      isExternalTask = ImplementationTypeHelper.getImplementationType(externalBo) === 'external';

  // .. 或具有选定外部实现类型的外部任务
  return !!ImplementationTypeHelper.isExternalCapable(externalBo) && isExternalTask;
};

// 获取监听器label
var getListenerLabel = function(param, translate) {

  if (is(param, 'activiti:ExecutionListener')) {
    return translate('Execution Listener');
  }

  if (is(param, 'activiti:TaskListener')) {
    return translate('Task Listener');
  }

  return '';
};

// 提示内容
var PROCESS_KEY_HINT = 'This maps to the process definition key.';
var TASK_KEY_HINT = 'This maps to the task definition key.';

// 创建基本信息模块 ============================================================
function createGeneralTabGroups(element, canvas, bpmnFactory,elementRegistry, elementTemplates, translate) {
  
  // 外部标签的参考目标元素
  element = element.labelTarget || element;

  // 基本信息
  var generalGroup = {
    id: 'general',
    label: translate('General'),
    entries: []
  };

  var idOptions;
  var processOptions;

  if (is(element, 'bpmn:Process')) {
    idOptions = { description: PROCESS_KEY_HINT };
  }

  if (is(element, 'bpmn:UserTask')) {
    idOptions = { description: TASK_KEY_HINT };
  }

  if (is(element, 'bpmn:Participant')) {
    processOptions = { processIdDescription: PROCESS_KEY_HINT };
  }

  idProps(generalGroup, element, translate, idOptions);// id
  nameProps(generalGroup, element, bpmnFactory, canvas, translate);// name
  processProps(generalGroup, element, translate, processOptions);// 进程
  executableProps(generalGroup, element, translate);// 是否可执行
  versionTag(generalGroup, element, translate);// 版本
  elementTemplateChooserProps(generalGroup, element, elementTemplates, translate);// 元素组件

  // 自定义字段
  var customFieldsGroups = elementTemplateCustomProps(element, elementTemplates, bpmnFactory, translate);// 元素组件的自定义

  // 详细信息
  var detailsGroup = {
    id: 'details',
    label: translate('Details'),
    entries: []
  };
  serviceTaskDelegateProps(detailsGroup, element, bpmnFactory, translate);// 服务任务委托
  userTaskProps(detailsGroup, element, translate);// 用户任务
  scriptProps(detailsGroup, element, bpmnFactory, translate);// 脚本任务
  linkProps(detailsGroup, element, translate);// link
  callActivityProps(detailsGroup, element, bpmnFactory, translate);// 调用活动
  eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);// event
  errorProps(detailsGroup, element, bpmnFactory, translate);// error
  conditionalProps(detailsGroup, element, bpmnFactory, translate);// 条件
  startEventInitiator(detailsGroup, element, translate); // 开始事件的发起者 （这必须是详细信息组的最后一个元素！）

  // 多实例
  var multiInstanceGroup = {
    id: 'multiInstance',
    label: translate('Multi Instance'),
    entries: []
  };
  multiInstanceProps(multiInstanceGroup, element, bpmnFactory, translate);

  // 异步延续
  var asyncGroup = {
    id : 'async',
    label: translate('Asynchronous Continuations'),
    entries : []
  };
  asynchronousContinuationProps(asyncGroup, element, bpmnFactory, translate);

  // 作业配置
  var jobConfigurationGroup = {
    id : 'jobConfiguration',
    label : translate('Job Configuration'),
    entries : [],
    enabled: isJobConfigEnabled
  };
  jobConfiguration(jobConfigurationGroup, element, bpmnFactory, translate);

  // 外部任务配置
  var externalTaskGroup = {
    id : 'externalTaskConfiguration',
    label : translate('External Task Configuration'),
    entries : [],
    enabled: isExternalTaskPriorityEnabled
  };
  externalTaskConfiguration(externalTaskGroup, element, bpmnFactory, translate);

  // 候选启动组/用户
  var candidateStarterGroup = {
    id: 'candidateStarterConfiguration',
    label: translate('Candidate Starter Configuration'),
    entries: []
  };
  candidateStarter(candidateStarterGroup, element, bpmnFactory, translate);

  // 历史活动时间
  var historyTimeToLiveGroup = {
    id: 'historyConfiguration',
    label: translate('History Configuration'),
    entries: []
  };
  historyTimeToLive(historyTimeToLiveGroup, element, bpmnFactory, translate);

  // 任务列表
  var tasklistGroup = {
    id: 'tasklist',
    label: translate('Tasklist Configuration'),
    entries: []
  };
  tasklist(tasklistGroup, element, bpmnFactory, translate);

  // 文档
  var documentationGroup = {
    id: 'documentation',
    label: translate('Documentation'),
    entries: []
  };
  documentationProps(documentationGroup, element, bpmnFactory, translate);

  var groups = [];
  groups.push(generalGroup);
  customFieldsGroups.forEach(function(group) {
    groups.push(group);
  });
  groups.push(detailsGroup);
  groups.push(externalTaskGroup);
  groups.push(multiInstanceGroup);
  groups.push(asyncGroup);
  groups.push(jobConfigurationGroup);
  groups.push(candidateStarterGroup);
  groups.push(historyTimeToLiveGroup);
  groups.push(tasklistGroup);
  groups.push(documentationGroup);

  return groups;
};

// 创建表单模块 ============================================================
function createFormsTabGroups(element, bpmnFactory, elementRegistry, translate) {
  // 表单
  var formGroup = {
    id : 'forms',
    label : translate('Forms'),
    entries: []
  };
  formProps(formGroup, element, bpmnFactory, translate);

  return [
    formGroup
  ];
}

// 创建监听器模块 ============================================================
function createListenersTabGroups(element, bpmnFactory, elementRegistry, translate) {

  // 监听器
  var listenersGroup = {
    id : 'listeners',
    label: translate('Listeners'),
    entries: []
  };

  var options = listenerProps(listenersGroup, element, bpmnFactory, translate);
  
  // 监听详情
  var listenerDetailsGroup = {
    id: 'listener-details',
    entries: [],
    enabled: function(element, node) {
      return options.getSelectedListener(element, node);
    },
    label: function(element, node) {
      var param = options.getSelectedListener(element, node);
      return getListenerLabel(param, translate);
    }
  };

  listenerDetails(listenerDetailsGroup, element, bpmnFactory, options, translate);

  // 监听字段
  var listenerFieldsGroup = {
    id: 'listener-fields',
    label: translate('Field Injection'),
    entries: [],
    enabled: function(element, node) {
      return options.getSelectedListener(element, node);
    }
  };

  listenerFields(listenerFieldsGroup, element, bpmnFactory, options, translate);

  return [
    listenersGroup,
    listenerDetailsGroup,
    listenerFieldsGroup
  ];
};

// 自定义aciviti属性板块 ============================================================
function ActicitiPropertiesProvider(eventBus, canvas, bpmnFactory, elementRegistry, elementTemplates, translate) {

  PropertiesActivator.call(this, eventBus);

  this.getTabs = function(element) {

    // 基本信息
    var generalTab = {
      id: 'general',
      label: translate('General'),
      groups: createGeneralTabGroups(element, canvas, bpmnFactory,elementRegistry, elementTemplates, translate)
    };

    // 表单
    var formsTab = {
      id: 'forms',
      label: translate('Forms'),
      groups: createFormsTabGroups(element, bpmnFactory, elementRegistry, translate)
    };
    
    // 监听器
    var listenersTab = {
      id: 'listeners',
      label: translate('Listeners'),
      groups: createListenersTabGroups(element, bpmnFactory, elementRegistry, translate),
      enabled: function(element) {
        return !eventDefinitionHelper.getLinkEventDefinition(element)
          || (!is(element, 'bpmn:IntermediateThrowEvent')
          && eventDefinitionHelper.getLinkEventDefinition(element));
      }
    };

    return [
      generalTab,
      // formsTab,
      listenersTab
    ];
  };
};

ActicitiPropertiesProvider.$inject = [
  'eventBus',
  'canvas',
  'bpmnFactory',
  'elementRegistry',
  'elementTemplates',
  'translate'
];

inherits(ActicitiPropertiesProvider, PropertiesActivator);

export default ActicitiPropertiesProvider;

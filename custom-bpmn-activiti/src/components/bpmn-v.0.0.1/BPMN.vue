/*!
 * bpmn activiti 流程图 编辑、预览页面
 * @date    2019-10-22T10:14:18+0800
 * @author  chaunlin.Xiao
 * @version v1.0.0 (2019/10/22)
 * @company chuangxiangyuan
 */
<template>
  <div class="BPMN" v-loading="isLoading">
    <el-container>
      <!-- 容器 -->
      <el-main class="container-box">
        <div class="containers" ref="content" :style="{'height':config.height}">
          <div class="canvas" ref="canvas" ></div>
          <div id="js-properties-panel" ref="panel" class="panel" v-show="isShowPanel"></div>
        </div>
      </el-main>
      <el-footer class="operate-box" height="20px" v-show="config.showDownloadLink">
        <div id="operate_bpmn" class="operate">
          <a ref="saveDiagram" href="javascript:">本地下载画板（Xml）</a>
          <a ref="saveSvg" href="javascript:">本地下载画板（SVG）</a>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
  
  import Vue from 'vue'
  // 引入相关的依赖
  import BpmnViewer from 'bpmn-js/lib/NavigatedViewer'// 预览，建模依赖，可拖拽
  /*import BpmnViewer from 'bpmn-js/lib/Viewer'// 预览，建模依赖，不可拖拽*/
  import BpmnModeler from 'bpmn-js/lib/Modeler'// 编辑，建模依赖
  /*import BpmnModeler from './bpmn/customBpmn/custom/index.js'// 编辑，自定义形状，建模依赖*/

  import BpmnModeling from 'bpmn-js/lib/features/modeling/Modeling'// 增加事件监听器在Modeling里时使用

  import propertiesPanelModule from 'bpmn-js-properties-panel'// js属性面板

  // import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda/index.js'// (camunda)基于bpmn-js-properties-panel的节点属性面板,与propertiesPanelModule搭配使用
  import propertiesProviderModule from './bpmn/resourse/activiti/index.js'// (activiti)基于bpmn-js-properties-panel的节点属性面板,与propertiesPanelModule搭配使用

  // import activitiModdleDescriptor from './bpmn/resourse/camunda.json'// camunda模块解析引擎
  import activitiModdleDescriptor from './bpmn/resourse/activiti.json'// activti模块解析引擎

  // 引入bpmn公共方法
  import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

  // 引入.bpmn文件(diagrsamXML、如果需要外部引入.bpmn文件来渲染流程图，需要安装raw-loader来处理)

  // 引入自定义的附加或扩展模块
  import customElementsModule from './bpmn/customElements/index.js';// 自定义工具栏和节点形状、自定义表单
  import customTranslate from './bpmn/customTranslate/customTranslate.js';// 汉化，自定义翻译

  export default {
    name:'BPMN',
    data(){
      return {
        isLoading:false,
        bpmnModeler: null,// bpmn建模器
        container: null,// 容器
        canvas: null,// 画布
        customTranslateModule:null,// 自定义汉化包
        xmlStr:'',//XML字符串
        xmlSvg:'',//SVG字符串

        // 点击节点获取的数据
        nodeCode: "",
        nodeName: "",
        // 是否隐藏js属性面板
        isShowPanel:true,
        // 控制是否显示该按钮
        isShowPanelBtn:true,
      }
    },
    props: ['config'],
    methods:{  
      /**
       * 初始化流程模版
       * @author chuanlin.Xiao
       * @date   2019-10-28T14:41:43+0800
       * @param  {[type]}                 xmlStr 流程图的实例化xml
       * @return {[type]}                           [description]
       */
      initModel(xmlStr) {
        this.buildModel(this.config.type,xmlStr);//建模
      },
      
      /*
       bpmnModel 
       *********************************************************/
      //建模
      buildModel(type,xmlStr){
        if(type==='Modeler'){//能编辑
          this.panel.innerHTML = "";//清空该节点下所有的子节点
          this.canvas.innerHTML = "";//清空该节点下所有的子节点
          this.isShowPanelBtn = true;
          this.isShowPanel = true;
          this.bpmnModeler = new BpmnModeler({
            container: this.canvas,
            keyboard: {
              bindTo: window
            },
            //添加控制板
            propertiesPanel: {
              parent: '#js-properties-panel'
            },
            //附加模块
            additionalModules: [
              propertiesProviderModule,// 基于propertiesPanelModule的属性面板
              propertiesPanelModule,//属性面板

              this.customTranslateModule,// 汉化模块
              customElementsModule,// 自定义工具栏和节点形状、自定义表单
            ],
            //扩展模块
            moddleExtensions: {
              activiti: activitiModdleDescriptor
            },
          });
        }else{//不能编辑
          this.panel.innerHTML = "";//清空该节点下所有的子节点
          this.canvas.innerHTML = "";//清空该节点下所有的子节点
          this.isShowPanelBtn = false;
          this.isShowPanel = false;
          this.bpmnModeler = new BpmnViewer({
            container: this.canvas,
            keyboard: {
              bindTo: document
            },
            bpmnRenderer: {//bpmn样式渲染更改
              // defaultFillColor: '#333',
              // defaultStrokeColor: '#ff4500'
            },
            textRenderer: {//text样式渲染更改
              defaultStyle: {
                fontFamily: '"Nothing You Could Do"',
                fontWeight: 'bold',
                fontSize: 12,
                // lineHeight: 16
              },
              externalStyle: {
                fontSize: 12,
                // lineHeight: 16
              }
            }
          });
        }

        // 下载画板
        let _this = this
        // 获取a标签dom节点
        const downloadLink = this.$refs.saveDiagram;
        const downloadSvgLink = this.$refs.saveSvg;
        // 给图绑定事件，当图有发生改变就会触发这个事件
        this.bpmnModeler.on('commandStack.changed', function () {
          _this.saveDiagram(function (err, xml) {
            _this.setEncoded(downloadLink, 'activiti.bpmn', err ? null : xml)
          })

          _this.saveSVG(function (err, svg) {
            _this.setEncoded(downloadSvgLink, 'activiti.svg', err ? null : svg)
          })
        });

        //创建新的画板（切换模版时，xml取自服务器；切换编辑和预览状态时，xml取自本地） 
        this.createNewDiagram(type,xmlStr); 
      },
      // 创建画板
      createNewDiagram(type,xmlStr) {
        const that = this;
        const bpmnXmlStr = xmlStr;
        // 将Xml字符串转换成图显示出来 (与后台交互获取到bpmnXmlStr并显示出来)
        this.bpmnModeler.importXML(bpmnXmlStr, function (err) {
          if (err) {
            console.error(err);
            that.error(err)
          }else {
            // 字符串转换成图成功后执行的函数
            that.success(type)
            // 子组件向父组件通讯
            // this.$parent.communicationEvent(data);
            // that.$emit('communicationEvent',data);
          }

          // 让图能自适应屏幕
          var canvas = that.bpmnModeler.get('canvas');
          canvas.zoom('fit-viewport');

          // 写死的某几个节点和线
          // const nodeCodes = ['StartEvent_1','Task_0qg0mca','Task_0307aue'];
          // const colorClass = 'nodeSuccess';
          // that.setNodeColor(nodeCodes, colorClass, canvas);
          // const nodeCodes2 = ['SequenceFlow_1u5gq9e','SequenceFlow_1n5pril'];
          // const colorClass2 = 'lineSuccess';
          // that.setNodeColor(nodeCodes2, colorClass2, canvas);
        })
      },
      // 通过与后台交互获取到已经走过的流程然后上色(这里是写死的某几个节点和线)
      setNodeColor(nodeCodes, colorClass, canvas){
        for(let i = 0; i < nodeCodes.length; i++) {
          // canvas.addMarker(nodeCodes[i], colorClass);
        }
      },
      // 转换成图的失败事件
      error(err) {
        Vue.prototype.$message.error({
            message: '流程图异常，无法显示！',
            type: 'error'
        });
      },
      // 转换成图的成功事件
      success(type) {
        const bpmnjs = this.bpmnModeler;
        const eventBus = bpmnjs.get('eventBus');
        const elementFactory = bpmnjs.get('elementFactory');
        if(type==='Modeler'){
          const commandStack = bpmnjs.get('commandStack');//仅Modeler需引入
          const bpmnRules = bpmnjs.get('bpmnRules');//仅Modeler需引入
          this.addBpmnListener(this, new BpmnModeling(eventBus,elementFactory,commandStack,bpmnRules));//增加事件监听器在Modeling里
          this.dubbleQueryInfo();
          this.colorEvent();
        }else{
          // this.setLineColor('Task_0307aue','RED', this, new BpmnModeling(eventBus,elementFactory));
          this.addBpmnListener(this, new BpmnModeling(eventBus,elementFactory));//增加事件监听器在Modeling里
        }    
      },
      // 增加事件监听器在Modeling里 ,通过点击事件获取到具体某个节点的信息
      addBpmnListener(_self,modeling) {
        const bpmnjs = this.bpmnModeler;
        const eventBus = bpmnjs.get('eventBus');
        const events = [
          'element.click',
          'element.dblclick'
        ];
        events.forEach(function(event) {
          eventBus.on(event, function(e) {
            //bpmn:Lane bpmn:SequenceFlow bpmn:Task bpmn:SequenceFlow bpmn:ExclusiveGateway
            //bpmn:Process
            // console.log(event + '   ' + JSON.stringify(e.element));
            if(e.element.type=='bpmn:Process'||e.element.type=='bpmn:Lane')
              return;

            var elementRegistry = bpmnjs.get('elementRegistry');
            var shape = elementRegistry.get(e.element.id);
            // console.log(shape)
            // 改变颜色
            // modeling.setColor(shape,{ stroke:'RED' });
            // 通过点击获取节点id和节点名称
            _self.nodeCode = shape.businessObject.id;
            _self.nodeName = shape.businessObject.name;
            console.log(shape.businessObject)  
            // console.log(_self.nodeCode)
            // console.log(_self.nodeName)
          })       
        })
      },
      //用户右键单击元素，获取信息
      dubbleQueryInfo(){
				const that = this;
				const bpmnjs = this.bpmnModeler;
        const moddle = this.bpmnModeler.get('moddle'),
              modeling = this.bpmnModeler.get('modeling');
        this.bpmnModeler.on('element.contextmenu', 1500, (event) => {
          event.originalEvent.preventDefault();
          event.originalEvent.stopPropagation();
          if(event.element.type=='bpmn:Process'||event.element.type=='bpmn:Lane')
              return;
					var elementRegistry = bpmnjs.get('elementRegistry');
					var shape = elementRegistry.get(event.element.id);
					
					if(shape.businessObject.$type=='bpmn:UserTask'){// 用户任务
						that.$emit('communicationEvent',shape.businessObject,getBusinessObject);// 右击自定义表单配置
					}
					
        });
      },
      //颜色(通过与后台交互获取到已经走过的流程然后上色)
      colorEvent(){
        const viewer = this.bpmnModeler;
        var overlays = viewer.get('overlays'),
            canvas = viewer.get('canvas'),
            elementRegistry = viewer.get('elementRegistry'),
            modeling = viewer.get('modeling');

        // Option 1: Color via Overlay
        // var shape = elementRegistry.get('Task_1ymuvem');
        // console.log(shape)
        // var div = document.createElement("div");
        // div.className = 'highlight-overlay';
        // div.style.width = shape.width+'px';
        // div.style.height = shape.height+'px';
        // var $overlayHtml = div;
        // overlays.add('Task_1ymuvem', {
        //   position: {
        //     top: 0,
        //     left: 0
        //   },
        //   html: $overlayHtml
        // });

        // Option 2: Color via BPMN 2.0 Extension
        // var elementToColor = elementRegistry.get('StartEvent_1');
        // modeling.setColor([ elementToColor ], {
        //   stroke: 'green',
        //   fill: 'rgba(0, 80, 0, 0.4)'
        // });

        // Option 3: Color via Marker + CSS Styling
        // canvas.addMarker('Task_0ho18x0', 'highlight');
      },

      // 下载为SVG格式,done是个函数，调用的时候传入的
      saveSVG (done) {
        // 把传入的done再传给bpmn原型的saveSVG函数调用
        this.bpmnModeler.saveSVG(done)
      },
      // 下载为Xml格式,done是个函数，调用的时候传入的
      saveDiagram (done) {
        let this_ = this;
        // 把传入的done再传给bpmn原型的saveXML函数调用
        this.bpmnModeler.saveXML({ format: true }, function (err, xml) {
          done(err, xml)
        })
      },
      // 当图发生改变的时候会调用这个函数，这个data就是图的xml
      setEncoded (link, name, data) {
        // 把xml转换为URI，下载要用到的
        const encodedData = encodeURIComponent(data);
        // 获取到图的xml，保存就是把这个xml提交给后台
        name==="activiti.bpmn"?this.xmlStr = data : this.xmlSvg = data;
        // console.log(this.xmlStr)
        // 下载图的具体操作,改变a的属性，className令a标签可点击，href令能下载，download是下载的文件的名字
        if (data) {
          link.className = 'active'
          link.href = 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData
          link.download = name
        }
      },
    },
    mounted(){
      
      // 获取到属性ref为“content”的dom节点
      this.container = this.$refs.content
      // 获取到属性ref为“canvas”的dom节点
      this.canvas = this.$refs.canvas;
      // 获取到属性ref为“panel”的dom节点
      this.panel = this.$refs.panel;
      // 定义声明汉化模块
      this.customTranslateModule = {
        translate: [ 'value', customTranslate ]
      };
      //初始化流程模版
      // this.initModel(this.config.xmlStr);

      // this.bpmnModeler.detach();//动态分离面板
      // this.bpmnModeler.attachTo('#el');//动态连接到某个元素上

      // 获取config到common.js
      this.common.bpmnConfig = this.config;
    }
  }
  
</script>

<style lang="less">
  @import './bpmn/bpmn.less';
</style>

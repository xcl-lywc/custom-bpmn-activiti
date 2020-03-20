# custom-bpmn-activiti

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```




#custom-bpmn-activiti组件

### custom-bpmn-activiti组件的打包命令
```
npm run build_webpack_dev 或  npm run lib
// 说明:该自定义组件有两种打包发布方式npm run webpack --mode development  与  npm run lib
//      第一种是自定义的,第二种是通用的,建议使用第一种
//      第一种打包发布的相关文件:index.js  package.json webpack.config.js
//      第二种打包发布的相关文件:index.my.js package.my.json(使用第一种时，需改名为package.json)

```

### custom-bpmn-activiti组件所需环境
```
vue、element-ui
```
### custom-bpmn-activiti组件下载
```
npm install custom-bpmn-activiti
```

### custom-bpmn-activiti组件的使用



	1. 引用element-ui组件
	
	import ElementUI from 'element-ui'
	
	import 'element-ui/lib/theme-chalk/index.css'
	
	Vue.use(ElementUI)

	2. 引用BpmnModel组件
	
	<BpmnModel ref="activiti_bpmn" :config="bpmnConfig" @communicationEvent="communicationEvent"></BpmnModel>

	import BpmnModel from 'custom-bpmn-activiti'
	
	3. js

	components: {
	  	BpmnModel
	},
	data(){
	    return{
	      bpmnConfig:{
	        width:'',//流程图容器宽度
	        height:'600px',//流程图容器高度
	        type:'Modeler',// 'Modeler'可编辑 'Viewer'预览
	        defaultXmlStr:
	        '<?xml version="1.0" encoding="UTF-8"?>\n'+
	        '<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:activiti="http://activiti.org/bpmn" targetNamespace="http://www.activiti.org/processdef">\n'+
	          '<process id=""/>\n'+
	          '<bpmndi:BPMNDiagram>\n'+
	            '<bpmndi:BPMNPlane bpmnElement=""/>\n'+
	          '</bpmndi:BPMNDiagram>\n'+
	        '</definitions>\n',// 默认的XML字符串
	        showDownloadLink:false,//是否展示本地下载链接
	        request:{
	          url:this.common.basePath,
	    	  token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWFsTmFtZSI6ImFkbWluIiwiYXVkIjpbInJlc291cmNlSWQiLCJ0YXNrIiwiYWN0aXZpdGkiLCJ3ZWJzb2NrZXQiLCJwbGVjdHVyZSIsInBvbS1taWRkbGUtc2VydmVyIiwidXNlciIsInRhc2syIiwibWVldGluZyIsInBhcnR5IiwiaG9tZSJdLCJ1c2VyX25hbWUiOiJhZG1pbiIsInNjb3BlIjpbInNjb3BlIiwiMyIsIjQiXSwiZXhwIjoxNTc2Njk3OTQwLCJ1c2VySWQiOjEsImp0aSI6ImQ2ZmVjYzRkLTk0Y2MtNDYzNS05YjdiLTZkOTY2NGY0NWRiNyIsImNsaWVudF9pZCI6ImNsaWVudDEiLCJ1c2VyUmVzb3VyY2UiOlsiMV93b3JrYmVuY2hPcmdhbml6YXRpb25hbFN0cnVjdHVyZV9vcmdhbml6YXRpb25zdHJ1Y3R1cmUiLCIxX2V4aGliaXRpb25KdXN0TG9va19ob21lIiwiMV93b3JrYmVuY2hBcnRpY2xlX2hvbWUiLCIxX3BvcnRhbE5ldHdvcmtfaG9tZSIsIjFfeCIsIjFfY291cnNlX2NvdXJzZWxlYXJuIl19.MN0o73jO_07qJwJGSxa6U-hVSSlR0bwWK8dkZM3kXt4'
	        }
	      },
	     };
	  	},
		mounted(){
		  this.$refs.activiti_bpmn.initModel(this.bpmnConfig.defaultXmlStr);
		},
		methods:{
		  /**
		   * 子组件向父组件通讯事件
		   * @author chuanlin.Xiao
		   * @date   2019-10-29T15:28:52+0800
		   * @param  {[type]}                 data [description]
		   * @return {[type]}                      [description]
		   */
		  communicationEvent() {
		  
		  }
		}

      3. 获取xml
      
	  this.$refs.activiti_bpmn.saveDiagram(function (err, xml) {
        console.log(xml)
      })


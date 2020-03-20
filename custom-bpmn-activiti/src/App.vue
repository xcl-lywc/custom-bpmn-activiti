<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <el-button @click="click">点击console.log(xml)</el-button>
    <BpmnModel ref="activiti_bpmn" :config="bpmnConfig" @communicationEvent="communicationEvent"></BpmnModel>
		<el-dialog
		  title="表单配置"
		  top="5vh"
		  custom-class="peizhi"
		  :visible.sync="isShowForm"
		  width="1200px">
		  <div v-loading="formLoading">
		  	<custom-form @saveCustomForm="handleSubmit" :dataDict="dataDict" :sortable_item="sortable_item"></custom-form>
		  </div>
		  <span slot="footer" class="dialog-footer">
		    <el-button @click="isShowForm = false" size="small">取 消</el-button>
		  </span>
		</el-dialog>
  </div>
</template>

<script>
  import BpmnModel from './components/bpmn-v.0.0.1/BPMN.vue'

  export default {
    name: 'app',
    components: {
      BpmnModel
    },
    data(){
      return{
        bpmnConfig:{
          width:'',//流程图容器宽度
          height:'800px',//流程图容器高度
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
            token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWFsTmFtZSI6ImFkbWluIiwiYXVkIjpbInJlc291cmNlSWQiLCJ0YXNrIiwiYWN0aXZpdGkiLCJ3ZWJzb2NrZXQiLCJwbGVjdHVyZSIsInBvbS1taWRkbGUtc2VydmVyIiwidXNlciIsInRhc2syIiwibWVldGluZyIsInBhcnR5IiwiaG9tZSJdLCJ1c2VyX25hbWUiOiJhZG1pbiIsInNjb3BlIjpbInNjb3BlIiwiMyIsIjQiXSwiZXhwIjoxNTc2Nzc5MDAwLCJ1c2VySWQiOjEsImp0aSI6ImI4NmRhOTZkLTA5YTQtNGZjYS1iYWE4LTdkMGZmNGNlYTQ0MCIsImNsaWVudF9pZCI6ImNsaWVudDEiLCJ1c2VyUmVzb3VyY2UiOlsiMV93b3JrYmVuY2hPcmdhbml6YXRpb25hbFN0cnVjdHVyZV9vcmdhbml6YXRpb25zdHJ1Y3R1cmUiLCIxX2V4aGliaXRpb25KdXN0TG9va19ob21lIiwiMV93b3JrYmVuY2hBcnRpY2xlX2hvbWUiLCIxX3BvcnRhbE5ldHdvcmtfaG9tZSIsIjFfeCIsIjFfY291cnNlX2NvdXJzZWxlYXJuIl19.PErX4Pv3nP9nXtoA4wLGnU7SCtXsx_sOTXMDLQ0PSs4'
          }
        },
				formLoading:false,
				isShowForm:false,
				element:null,
				getBusinessObject:null,
				dataDict: [],
				sortable_item: [], //最后需要保存的表单数据
      }
    },
    create(){

    },
    mounted(){
      this.$refs.activiti_bpmn.initModel(this.bpmnConfig.defaultXmlStr);
			this.getFormDictJson();
    },
    methods:{
			
      /**
       * 子组件向父组件通讯事件（表单配置）
       */
      communicationEvent(element,getBusinessObject) {
				this.sortable_item = [];//清空表单配置右侧的数据
				this.isShowForm = true;
        console.log(element,getBusinessObject);

				this.element = element
				this.getBusinessObject = getBusinessObject;

				let formKey = getBusinessObject(element).get('activiti:formKey');// 获取formKey
				formKey!=undefined?this.getFormData(formKey):'';
      },  
			
			/**
			 * 提交表单配置
			 */
			handleSubmit(foromData) { 
			  let params = {
			    "value": this.element.id,
			    "formData": foromData
			  } 
			  let self = this;
			  this.formLoading = false
			  let config = {
			    method: "post",
			    url: `${this.common.bpmnConfig.request.url}/activiti/form/save`,
			    data: params,
			    headers:{
			    	'Authorization':'Bearer '+this.common.bpmnConfig.request.token
			    }
			  }
			  this.axios(config).then((response) => {
			    this.$message.success(response.data.meta.message);
			    // 设置formkey到bpmn里面
			    var bo      = this.getBusinessObject(this.element),
			        formKey = response.data.data || undefined;
			    bo.set('activiti:formKey',formKey)
			
			    // this.getFormData(formKey);// 刷新
			    this.isShowForm = false;
			    this.formLoading = false;
			  }).catch((errorMsg) => {
			    this.formLoading = false
			    this.$message.error(errorMsg)
			  })
			}, 
			/**
			 * 获取字典（表单配置）
			 */
			getFormDictJson(){
			  let config = {
			    method: "post",
			    url: `${this.common.bpmnConfig.request.url}/user/dictionary/type/json`,
			    data: {},
			    headers:{
			    	'Authorization':'Bearer '+this.common.bpmnConfig.request.token
			    }
			  }
			  this.axios(config).then((response) => {
			    this.dataDict = response.data.data.items;
			  }).catch((errorMsg) => {
			    this.$message.error(errorMsg)
			  })
			},
			/**
			 * 获取表单配置
			 */
			getFormData(formKey){ 
			  this.formLoading = true
			  let config = {
			    method: "get",
			    url: `${this.common.bpmnConfig.request.url}/activiti/form/id`,
			    params: {id:formKey},
			    headers:{
			    	'Authorization':'Bearer '+this.common.bpmnConfig.request.token
			    }
			  }
			  this.axios(config).then((response) => {
			    this.sortable_item = response.data.data ? response.data.data.formData : [];
			    this.formLoading = false;
			  }).catch((errorMsg) => {
			    this.formLoading = false
			    this.$message.error(errorMsg)
			  })
			},
			
			/**
			 * 点击console.log(xml)
			 */
      click(){
        this.$refs.activiti_bpmn.saveDiagram(function (err, xml) {
          console.log(xml)
        })
      }        
    }
  }
</script>

<style lang="less">
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    margin-top: 60px;
		
		.el-dialog__wrapper{
		  z-index:5000 !important;
		  .el-dialog.peizhi{
		    background: #f7f7f7;
		  }
		}
  }
		
	.el-select-dropdown.el-popper{
		z-index:9999 !important;
	}
</style>

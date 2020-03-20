<template>
	<div class="form-component" :id="id">
		<el-dialog
		  title="表单配置"
      top="5vh"
      custom-class="peizhi"
		  :visible.sync="isShow"
		  :before-close="handleCancel"
		  width="1200px">
		  <div v-loading="loading">
		  	<custom-form @saveCustomForm="handleSubmit" :dataDict="dataDict" :sortable_item="sortable_item"></custom-form>
		  </div>
		  <span slot="footer" class="dialog-footer">
		    <el-button @click="handleCancel" size="small">取 消</el-button>
		    <!-- <el-button type="primary" @click="handleOk" size="small">确 定</el-button> -->
		  </span>
		</el-dialog>
	</div>
</template>

<script>
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
export default {
	name: 'form-modal',
	components:{
		
	},
	data(){
		return{
			loading:false,
			isShow:true,
			dataDict: [],
			sortable_item: [], //最后需要保存的表单数据
		}
	},
	computed:{
	  
	},
	props:{
		id:{
			type: String,
			default: null
		},
		element: {
			type: Object,
			default: null,
		},
	},
	mounted(){
		// console.log('commonjs',this.common)
		// console.log('element',this.element)
		// console.log('formKey',getBusinessObject(this.element).get('activiti:formKey'))
		// console.log('element_id',this.id)
		this.getFormDictJson();
		let formKey = getBusinessObject(this.element).get('activiti:formKey');// 获取formKey
		formKey!=undefined?this.getFormData(formKey):'';
	},
	methods:{
		handleOk(){
			this.isShow = false;
			document.getElementsByClassName('BPMN')[0].removeChild(document.getElementById(this.id));
		},
		handleCancel(){
			this.isShow = false;
			document.getElementsByClassName('BPMN')[0].removeChild(document.getElementById(this.id));
		},
		/**
     * 提交表单配置
     */
    handleSubmit(foromData) { 
      let params = {
        "value": this.id,
        "formData": foromData
      } 
      let self = this;
      this.loading = false
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
        var bo      = getBusinessObject(this.element),
            formKey = response.data.data || undefined;
        bo.set('activiti:formKey',formKey)

        // this.getFormData(formKey);// 刷新
        this.handleOk();
        this.loading = false;
      }).catch((errorMsg) => {
        this.loading = false
        this.$message.error(errorMsg)
      })
    }, 
    /**
     * 获取字典
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
      this.loading = true
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
        this.loading = false;
      }).catch((errorMsg) => {
        this.loading = false
        this.$message.error(errorMsg)
      })
    },
	}
}
</script>

<style lang="less">
  .form-component{
    .el-dialog__wrapper{
      z-index:9999 !important;
      .el-dialog.peizhi{
        background: #f7f7f7;
      }
    }
    
  }
</style>



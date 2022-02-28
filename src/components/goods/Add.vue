<template>
    <div>
        <!-- 导航 -->
        <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 提示区域 -->
        <el-alert
    title="添加商品信息"
    type="info" show-icon center
    :closable="false">
  </el-alert>
  <!-- 步骤条 -->
  <el-steps :space="200" :active="activeindex-0" finish-status="success" align-center="">
  <el-step title="基本信息"></el-step>
  <el-step title="商品参数"></el-step>
  <el-step title="商品属性"></el-step>
  <el-step title="商品图片"></el-step>
  <el-step title="商品内容"></el-step>
  <el-step title="完成"></el-step>
</el-steps>
<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
<!-- tab栏区域 -->
<el-tabs :tab-position="'left'" v-model="activeindex"  @tab-click="tabClicked" :before-leave="beforeTabLeave">
    <el-tab-pane label="基本信息" name="0" prop="goods_name">
        <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="addForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
            <el-input type="number" v-model="addForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight" >
            <el-input type="number" v-model="addForm.goods_weight"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number" >
            <el-input type="number" v-model="addForm.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品分类" prop="goods_cat" >
            <el-cascader
            expand-trigger="hover"
            v-model="addForm.goods_cat"
    :options="catelist"
    :props="cateProps"
    @change="handleChange"
    ></el-cascader>
        </el-form-item>
        
    </el-tab-pane>
    <el-tab-pane label="商品参数" name="1" >
        <!-- 渲染表单的item项 -->
        <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
            <!-- 复选框组 -->
            <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border=""></el-checkbox>
             </el-checkbox-group>
        </el-form-item>
    </el-tab-pane>
    <el-tab-pane label="商品属性" name="2">
        <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
            <el-input v-model="item.attr_vals"></el-input>
        </el-form-item>
    </el-tab-pane>
    <el-tab-pane label="商品图片" name="3">
        <!--  action 图片上传到的后台api地址-->
        <el-upload 
             :on-success="handleSuccess"
            :headers="headerObj"      
            class="upload-demo"
            :action="upLoadUrl"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            list-type="picture">
            <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
    </el-tab-pane>
    <el-tab-pane label="商品内容" name="4">
        <!-- 富文本编辑器 -->
        <quill-editor v-model="addForm.goods_introduce">

        </quill-editor>
        <el-button type="primary" style="margin-top:15px" @click="add">添加商品</el-button>
    </el-tab-pane>
  </el-tabs>
  </el-form >
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog
  title="图片预览"
  :visible.sync="previewVisible"
  width="50%">
<img :src="previewPath" alt="" class="priviewimg">
</el-dialog>
    </div>
</template>
<script>
import _ from 'lodash'
export default {
    data(){
        return{
            activeindex:'0',
            //添加商品的表单数据项
            addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        pics:[],
        //商品详情描述
        goods_introduce:'',
        attrs:[]
      },
             addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
            //商品分类列表
            catelist: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
            //动态参数数据
            manyTableData:[],
            //静态属性参数
            onlyTableData:[],
            upLoadUrl:'http://127.0.0.1:8888/api/private/v1/upload',
            //图片上传组件的headers请求头对象
            headerObj:{
                Authorization:window.sessionStorage.getItem('token')
            },
            previewPath:'',
            previewVisible:false
            
        }
    },
   created() {
    this.getCateList()
  },
    methods:{
        // 获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！')
      }

      this.catelist = res.data
      console.log(this.catelist)
    },
        //级联选择器选中项变化会触发
        handleChange() {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
       beforeTabLeave(activeName, oldActiveName) {
      // console.log('即将离开的标签页名字是：' + oldActiveName)
      // console.log('即将进入的标签页名字是：' + activeName)
      // return false
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
        async tabClicked(){
            //访问动态参数面版
            if(this.activeindex==='1'){
               const {data:res}=await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'many'}})
               if(res.meta.status!==200){
            return this.$message.error('获取动态参数数据失败')
            
             }
            //console.log(this.manyTableData)
                res.data.forEach(item=>{
                     item.attr_vals=
                    item.attr_vals.length===0?[]:
                    item.attr_vals.split(' ')
                 })

                    this.manyTableData=res.data
            }
             else if(this.activeindex==='2'){
                const {data:res}=await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'only'}})
                 if(res.meta.status!==200){
            return this.$message.error('获取静态属性数据失败')           
             }
             //console.log(res.data)
             this.onlyTableData=res.data

            }
        },
        //处理图片预览效果
        handlePreview(file){
            this.previewPath=file.response.data.url
            this.previewVisible=true

        },
        //处理移除图片的操作
        handleRemove(file){
            //获取要删除图片的临时路径，从pics数组中找到该图片的索引值，调用splice方法移除
            const filepath=file.response.data.tmp_path
            const i =this.addForm.pics.findIndex(x=>
                x.pic===filepath)
                this.addForm.pics.splice(i,1)
                console.log(this.addForm)
            

        },
        //监听图片上传成功的事件
        handleSuccess(response){
            console.log(response)
            //拼接得到一个图片信息对象
            const picInfo={pic:response.data.tmp_path}
            //将图片信息对象push到pics数组中
            this.addForm.pics.push(picInfo)

        },
        //添加商品
        add(){
            this.$refs.addFormRef.validate(async valid=>{
                if(!valid){
                    return this.$message.error('请填必要的表单项')
                }
                //执行添加业务逻辑
                const form =_.cloneDeep(this.addForm)
                    form.goods_cat=form.goods_cat.join(',')
                   
                    //处理动态参数
                    this.manyTableData.forEach(item=>{
                        const newInfo={
                            attr_id:item.attr_id,
                            attr_value:item.attr_vals.join('')
                        }
                        this.addForm.attrs.push(newInfo)
                    })
                    //处理静态属性
                    this.onlyTableData.forEach(item=>{
                        const newInfo={
                            attr_id:item.attr_id,
                            attr_value:item.attr_vals
                        }
                        this.addForm.attrs.push(newInfo)
                    })
                    form.attrs=this.addForm.attrs
                    console.log(form)
                    // 发起请求添加商品
                    // 商品的名称，必须是唯一的
                    const { data: res } = await this.$http.post('goods', form)

                    if (res.meta.status !== 201) {
                        return this.$message.error('添加商品失败！')
                         }

                    this.$message.success('添加商品成功！')
                    this.$router.push('/goods')
                        })

        }

    },
    computed:{
        cateId(){
            if(this.addForm.goods_cat.length===3){
                return this.addForm.goods_cat[2]
            }
            return null
        }
    }
    
}
</script>
<style scoped>
.el-checkbox{
    margin: 0 5px 0 0;
}
.priviewimg{
    width: 100%;
}

</style>
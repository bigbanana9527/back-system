<template>
    <div>
        <!-- 导航 -->
        <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
        <el-row>
            <el-col>
                <el-button type="primary" @click="showAddCatDialog">添加分类</el-button>
            </el-col>
        </el-row>
        <!-- 表格 -->
        <tree-table :data="catelist" :columns="columns" class="treetable"
        :selection-type="false" :expand-type="false"
        show-index index-text="#" border>
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
            <i class="el-icon-success" v-if="!scope.row.cat_deleted" style="color:lightgreen;"></i>
            <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
            <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
            <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
            <el-tag type="warning" size="mini" v-else>三级</el-tag>
            </template>
             <!-- 操作 -->
            <template slot="opt" >
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
             <el-button type="danger" icon="el-icon-edit" size="mini">删除</el-button>
            </template>
        </tree-table>
       
        
        <!-- 分页区域 -->
        <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="querInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="querInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
  title="添加分类"
  :visible.sync="addCateDialogVisible"
  width="50%"
  @close="addCateDialogClosed">
  <!-- 添加分类表单 -->
  <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
  <el-form-item label="分类名称:" prop="cat_name">
    <el-input v-model="addCateForm.cat_name"></el-input>
  </el-form-item>
  <el-form-item label="父级分类">
      <el-cascader
    v-model="selectKeys"
    :options="ParentCateList"
    :props="cascaderProps"
    @change="parentCateChanged" clearable change-on-select></el-cascader>
    
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
</el-dialog>

    </div>
</template>
<script>
export default {
    data(){
        return{
            addCateDialogVisible:false,
            //查询条件
            querInfo:{
                type:3,
                pagenum:1,
                pagesize:5
            },
            //商品分类的数据列表，默认为空
            catelist:[],
            //总数据条数
            total:0,
            columns:[{label:'分类名称',
                    prop:'cat_name'
            },{label:'是否有效',
            //表示将当前列定义为模板
            type:'template',
            //表示当前这一列使用的模板名称
            template:'isok'},
            {label:'排序',
            //表示将当前列定义为模板
            type:'template',
            //表示当前这一列使用的模板名称
            template:'order'},
            {label:'操作',
            //表示将当前列定义为模板
            type:'template',
            //表示当前这一列使用的模板名称
            template:'opt'}
            ],
            //添加分类表单数据对象
            addCateForm:{
                //将要添加分类的名称
                cat_name:'',
                //父级分类id
                cat_pid:0,
                //默认要添加的是1级分类
                cat_level:0
            },
            //添加分类表单的验证规则
            addCateFormRules:{
                cat_name:[{required:true,message:'请输入分类名称',trigger:'blur'}]
            },
            //父级分类列表
            ParentCateList:[],
            //指定级联选择器的配置对象
            cascaderProps:{
                value:'cat_id',
                label:'cat_name',
                children:'children'
            },
            //选中的父级分类id数组
            selectKeys:{}
        }
    },
    created(){
        this.getCateList()
    },
    methods:{
        //获取商品分类数据
        async getCateList(){
            const {data:res}=await this.$http.get('categories',{params:this.querInfo})
            if(res.meta.status!==200) return this.$message.error('获取商品分类数据失败')
            //把数据列表赋值给catelist
            this.catelist=res.data.result
            this.total=res.data.total

        },
        //监听pagesize改变事件
        handleSizeChange(newSize){
            this.querInfo.pagesize=newSize
            this.getCateList()

        },
        handleCurrentChange(newPage){
            this.querInfo.pagenum=newPage
            this.getCateList()

        },
        showAddCatDialog(){
            //获取父级分类的数据列表
            this.getParentCateList()
            this.addCateDialogVisible=true
            
        },
        //获取父级分类的数据表
        async getParentCateList(){
           const {data:res}=await this.$http.get('categories',{parms:{type:2}})
           if(res.meta.status!==200) return this.$message.error('获取父级分类数据失败')
          //console.log(res.data)
          this.ParentCateList=res.data

        },
        //选择项发生变化触发这个函数
        parentCateChanged(){
            //如果selectKeys数组中的length大于0，证明选中的父级分类
            //反之没有选中任何父级分类
            if(this.selectKeys.length>0){
                //父级分类的id
                this.addCateForm.cat_pid=this.selectKeys[
                    this.selectKeys.length-1
                ]
                //为当前分类的等级赋值
                this.addCateForm.cat_level=this.selectKeys.length
                return
            }else{
                this.addCateForm.cat_pid=0
                this.addCateForm.cat_level=0
            }

        },
        //点击按钮，添加新的分类
        addCate(){
            //console.log(this.addCateForm)
            this.$refs.addCateFormRef.validate(async vaild=>{
                if(!vaild)return
                const{data:res}=await this.$http.post('categories',this.addCateForm)
                if(res.meta.status!==201) return this.$message.error('获取分类失败')
                this.$message.success('获取分类成功')
                this.getCateList()
                this.addCateDialogVisible=false
            })

        },
        //监听对话框关闭事件，重置表单数据
        addCateDialogClosed(){
            this.$refs.addCateFormRef.resetFields()
            this.selectKeys=[]
            this.addCateForm.cat_level=0
            this.addCateForm.cat_pid=0
        }
    }
    
}
</script>
<style scoped>
.treetable{
    margin-top: 15px;
}
.el-cascader{
    width: 100%;
}
</style>
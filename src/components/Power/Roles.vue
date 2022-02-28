<template>
    <div>
        <!-- 导航 -->
        <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
        <!-- 添加角色按钮区域 -->
        <el-row>
            <el-col>
                <el-button type="primary">添加角色</el-button>
            </el-col>
        </el-row>
        <!-- 角色列表区域 -->
        <el-table :data="roleList" border="" stripe="">
            <!-- 展开列 -->
            <el-table-column type="expand">
                <template slot-scope="scope">
                    
                    <el-row :class="['bdbuttom',i1===0?'bdtop':'','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id"  >
                        <!-- 一级权限 -->
                    <el-col :span="5">
                        <el-tag closable @close="removeRightById(scope.row,item1.id)">
                        {{item1.authName}}
                        </el-tag>
                        <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="19">
                        <!-- 通过for循环嵌套渲染二级权限 -->
                       <el-row :class="[i2===0?'':'bdtop','vcenter']"  v-for="(item2,i2) in item1.children" :key="item2.id" >                          
                           <el-col :span="6">
                               <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                               <i class="el-icon-caret-right"></i>
                           </el-col>
                           <el-col :span="18">
                               <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">
                                   {{item3.authName}}
                               </el-tag>

                           </el-col>
                       </el-row>
                    </el-col>
                    
                    </el-row>
                   
                </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column >
                <template slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                    <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)" @close="setRightDiglogClosed">分配权限</el-button>
                    

                </template>
            </el-table-column>

        </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog
  title="分配权限"
  :visible.sync="setRightDialogVisible"
  width="50%">
  <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
</el-dialog>
    </div>
</template>
<script>
export default {
    data(){
        return{
            roleList:[],
            setRightDialogVisible:false,
            rightslist:[],
            //树形控件绑定对象
            treeProps:{
                label:'authName',
                children:'children'
            },
            //默认选中的节点id值数组
            defKeys:[],
            //当前即将分配权限的id
            roleId:''
        }
    },
    created(){
        this.getRolesList()
    },
    methods:{
        //获取所有角色列表
        async getRolesList(){
            const {data:res}=await this.$http.get('roles')
            if(res.meta.status!==200) return this.$message.error('获取角色列表失败')
            this.roleList=res.data
            console.log(this.roleList)

        },
        //根据id删除对应的权限
        async removeRightById(role,rightId){
            //弹框提示用户是否删除
            const confirmResult=await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
         if(confirmResult!=='confirm'){
          return this.$message.info('删除失败')
        }
        const {data:res}=await this.$http.delete( `roles/${role.id}/rights/${rightId}`)
        if(res.meta.status!==200) return this.$message.error('删除权限列表失败')
        //this.getRolesList()
        role.children=res.data
        this.$message.success('删除权限列表成功')


        },
        //展示分配权限对话框
        async showSetRightDialog(role){
            this.roleId=role.id
            //获取所以权限数据
            const {data:res}=await this.$http.get('rights/tree')
            if(res.meta.status!==200) return this.$message.error('获取权限数据失败')
            this.rightslist=res.data
            console.log(this.rightslist)
            //递归获取三级节点的id
            this.getLeafKeys(role,this.defKeys)
            this.setRightDialogVisible=true

        },
        //通过递归的形式获取角色下所有三级权限的id，并保存到defkeys数组中
        getLeafKeys(node,arr){
            if(!node.children){
                return arr.push(node.id)
            }
            node.children.forEach(item=>{
                this.getLeafKeys(item,arr)
            })

        },
        //监听分配权限对话框的关闭事件
        setRightDiglogClosed(){
            this.defKeys=[]

        },
        //点击为角色分配权限
        async allotRights(){
            const keys=[ ...this.$refs.treeRef.getCheckedKeys(),...this.$refs.treeRef.getHalfCheckedKeys()]
            //console.log(keys)
            const idStr=keys.join(',')//将数组变成字符串
            const {data:res}= await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
             if(res.meta.status!==200) return this.$message.error('分配权限失败')
             this.$message.success('分配权限成功')
             this.getRolesList()
             this.setRightDialogVisible=false
           

        }
    }
    
}
</script>
<style scoped>
.el-tag{
    margin: 7px;
}
.bdtop{
    border-top: 1px solid #eee;
}
.bdbuttom{
    border-bottom: 1px solid #eee;
}
.vcenter{
    display: flex;
    align-items: center;
}
</style>
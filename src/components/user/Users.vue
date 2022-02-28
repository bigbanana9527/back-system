<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="  addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column label="#" type="index" width="50"> </el-table-column>
        <el-table-column prop="username" label="姓名" width="180">
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="180">
        </el-table-column>
        <el-table-column prop="mobile" label="电话" width="180">
        </el-table-column>
        <el-table-column prop="role_name" label="角色" width="180">
        </el-table-column>
        <el-table-column prop="mg_state" label="状态" width="180">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"> </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180"> 
           <template  slot-scope="scope">
             <!-- 修改按钮 -->
             <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
             <!-- 删除按钮 -->
             <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
             <!-- 分配角色按钮 -->             
             <el-tooltip  effect="dark" content="分配角色" placement="top" :enterable="false" >
                <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
             </el-tooltip>
             </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog
  title="添加用户"
  :visible.sync="addDialogVisible"
  width="50%"
  @close="addDialogClosed">
  <!-- 内容主体区 -->
  <el-form ref="addFormRef" :model=" addForm" label-width="70px" :rules="addFormRules">
  <el-form-item label="用户名" prop="username">
    <el-input v-model="addForm.username"></el-input>
  </el-form-item>
  <el-form-item label="密码" prop="password">
    <el-input v-model="addForm.password"></el-input>
  </el-form-item>
  <el-form-item label="邮箱" prop="email">
    <el-input v-model="addForm.email"></el-input>
  </el-form-item>
  <el-form-item label="手机" prop="mobile">
    <el-input v-model="addForm.mobile"></el-input>
  </el-form-item>
  </el-form>
  <!-- 底部区域 -->
  <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
</el-dialog>
<!-- 修改用户对话框 -->
<el-dialog
  title="修改用户"
  :visible.sync="editDialogVisible"
  width="50%" @close="editDialogClosed">
  <el-form ref="editFormRef" :model="editForm" label-width="70px" :rules="editFormRules" >
  <el-form-item label="用户名">
    <el-input v-model="editForm.username" disabled></el-input>
  </el-form-item>
  <el-form-item label="邮箱" prop="email">
    <el-input v-model="editForm.email" ></el-input>
  </el-form-item>
  <el-form-item label="手机" prop="mobile">
    <el-input v-model="editForm.mobile"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
</el-dialog>
<!-- 分配角色对话框 -->
<el-dialog
  title="提示"
  :visible.sync="setRoleDialogVisible"
  width="50%"
  @close="setRoleDialogClosed">
  <div>
    <p>当前的用户：{{userInfo.username}}</p>
    <p>当前的角色：{{userInfo.role_name}}</p>
    <p>分配新角色：
      <el-select v-model="selectedRoleId" placeholder="请选择">
    <el-option
      v-for="item in rolesList"
      :key="item.id"
      :label="item.roleName"
      :value="item.id">
    </el-option>
  </el-select>

    </p>
  </div>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>
<script>
export default {
  data() {
         //验证邮箱规则
         var checkEmail = (rule, value, callback) => {
           const regEmail=/^[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*\.[a-z]{2,}$/
           if(regEmail.test(value)){
             return callback()
           }
           callback(new Error('请输入合法的邮箱'))
          };
         //验证手机
         var checkMoblie = (rule, value, callback) => {
           const regMoblie=/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
           if(regMoblie.test(value)){
             return callback()
           }
           callback(new Error('请输入合法的手机'))
          };
     
    return {
 
      //获取过户列表对象参数
      queryInfo: {
        query: "",
        //当前页数
        pagenum: 1,
        //每页显示多少条数据
        pagesize: 2,
      },
      userlist: [],
      total: 0,
      addDialogVisible:false,
      //添加表单数据
      addForm:{
          username:'', 
          password:'',
          email:'',
          mobile:''
      },
      editDialogVisible:false,
      //控制分配权限对话框
      setRoleDialogVisible:false,
      //需要被分配角色的用户信息
      userInfo:{},
      //所有角色数据列表
      rolesList:[],
      //已选中角色id
      selectedRoleId:'',
      //查询到的用户信息
      
        
      
      //添加表单的验证规则对象
      addFormRules:{
        username:[{required:true,message:'请输入用户名',trigger:'blur'},
        {min:3,max:10,message:'用户名在3~10位之间',trigger:'blur'}],
        password:[{required:true,message:'请输入密码',trigger:'blur'},
        {min:6,max:10,message:'密码在6~10位之间',trigger:'blur'}],
         email:[{required:true,message:'请输入邮箱',trigger:'blur'},
         {validator:checkEmail,trigger:'blur'}],
          mobile:[{required:true,message:'请输入手机号',trigger:'blur'},
          {validator:checkMoblie,trigger:'blur'} ]
      },
      editForm:{

      },
      editFormRules:{
       email:[{required:true,message:'请输入邮箱',trigger:'blur'},
         {validator:checkEmail,trigger:'blur'}],
          mobile:[{required:true,message:'请输入手机号',trigger:'blur'},
          {validator:checkMoblie,trigger:'blur'} ]
    },
    };
  },
  created() {
    this.getUserList();
  },

  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      //console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error("获取用户列表失败！");
      }
      this.userlist = res.data.users;
      this.total = res.data.total;
    },
    //监听pagesize改变事件
    handleSizeChange(newsize){
      this.queryInfo.pagesize=newsize
      this.getUserList();

    },
    //监听页码值改变的事件
    handleCurrentChange(newpage){
      this.queryInfo.pagenum=newpage;
      this.getUserList();
      

    },
    //监听开关状态改变
    async userStateChanged(userinfo){
      console.log(userinfo)
      const {data:res}=await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      console.log(res.meta.status)
      if(res.meta.status!==200){
        userinfo.mg_state=!userinfo.mg_state
        return this.$message.error('更新用户状态失败')}
        this.$message.success('更新用户状态成功')

    },
    //添加关闭用户对话框的关闭事件
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()

    },
    //点击按钮，添加新用户
    addUser(){
      this.$refs.addFormRef.validate(async valid=>{
        //console.log(valid)
        if(!valid) return
        //可以发出添加用户的网络请求
        const {data:res}=await this.$http.post('users',this.addForm)
        if(res.meta.status!==201){
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        //隐藏对话框
        this.addDialogVisible=false
        //重新获取列表
        this.getUserList()

      })

    },
    async showEditDialog(id){
      console.log(id)
      this.editDialogVisible=true
      const {data:res}=await this.$http.get('users/'+id)
      if(res.meta.status!==200 ){
         return this.$message.error('查询用户信息失败')
        }
        this.editForm=res.data
        
    },
    //修改表单验证
    
    //监听修改用户对话框的关闭事件
    editDialogClosed(){
      this.$refs.editFormRef.resetFields()

    },
    //修改用户信息并提交
    editUserInfo(){
      this.$refs.editFormRef.validate(async valid=>{
        //console.log(valid)
        if(!valid)return
        //发起请求
        const {data:res}=await this.$http.put('users/'+this.editForm.id,{
          email:this.editForm.email,
          mobile:this.editForm.mobile
        })
        if(res.meta.status!==200){
          return this.$message.error('更新用户信息失败！')
        }
        //关闭对话框
        this.editDialogVisible=false
        //刷新数据列表
        this.getUserList()
        //提示修改成功
        this.$message.success('更新用户信息成功！')
        
      })

    },
    //根据ID删除对应的用户信息
    async removeUserById(id){
      //询问用户是否删除数据
      const confirmResult=await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        //如果用户确认删除，则返回字符串confirm
        //如果用户取消了删除，则返回字符串cancel
        if(confirmResult!=='confirm'){
          return this.$message.info('已取消删除')
        }
        const {data:res}=await this.$http.delete('users/'+id)
        if(res.meta.status!==200){
          return this.$message.err('删除失败')
        }
        this.getUserList()
        this.$message.success('删除成功')

    },
    //展示分配角色对话框
    async setRole(userInfo){
      this.userInfo=userInfo
      //展开对话框之前，获取所有角色列表
      const {data:res}=await this.$http.get('roles')
       if(res.meta.status!==200){
          return this.$message.err('获取角色列表失败')
        }
        this.rolesList=res.data
      this.setRoleDialogVisible=true
    },
    //点击按钮分配角色
    async saveRoleInfo(){
      if(!this.selectedRoleId) return this.$message.error('请选择要分配的角色')
       const {data:res}=await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectedRoleId})
       if(res.meta.status!==200){
          return this.$message.err('更新角色失败')
        }
        this.$message.success('更新角色成功')
        this.getUserList()
        this.setRoleDialogVisible=false
    },
    //监听分配角色对话框的关闭事件，重置对话框
    setRoleDialogClosed(){
      this.selectedRoleId='',
      this.userInfo={}


    }
  },
};
</script>
<style scoped>
.el-breadcrumb {
  margin-bottom: 15x;
  font-size: 12px;
}
.el-card {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15) !important;
  margin-top: 10px;
}
.el-table {
  margin-top: 15px;
  font-size: 12px;
}
.el-pagination{
  margin-top: 15px;
}
</style>
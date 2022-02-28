<template>
  <div class="login_container">
        <div class="login_box">
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
                <el-form :model="loginForm" ref="loginFormRef" :rules="loginFormRules" label-width="0px" class="login_form">
                    <el-form-item prop="username">
                        <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
                   </el-form-item>
                   <el-form-item prop="password">
                        <el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
                   </el-form-item>
                   <el-form-item class="btn">
                        <el-button type="primary" @click="login">登录</el-button>
                   </el-form-item>
                </el-form>
           </div>
  </div>
       
</template>
<script>
export default {
    data(){
        return{
            loginForm:{
                username:'admin',
                password:'123456',

            },
            loginFormRules: {
          username: [
            { required: true, message: '请输入登录名称', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入登录密码', trigger: 'blur' },
            { min: 6, max: 10, message: '长度在 6 到 10 个字符', trigger: 'blur' }
           ],
          }
        }
    },
    methods:{
        resetloginForm(){
            //console.log(this);
            this.$refs.loginFormRef.resetFields();
        },
        login(){
            //表单预验证
            this.$refs.loginFormRef.validate(async valid=>{
                //console.log(vaild)
                if(!valid) return;
                const{data:res} = await this.$http.post("login",this.loginForm);
                //console.log(res)
                if(res.meta.status!==200) return this.$message.error('登录失败')
                this.$message.success('登录成功')
                //将登录成功之后的token，保存到客户端的sessionStorage中
                console.log(res)
                window.sessionStorage.setItem("token",res.data.token);
                //通过编程式导航跳转到后台主页/home
                this.$router.push('/home')
            })
            

        }
        
    }
    
}
</script>
<style scoped>
.login_container{
    background-color: #2b4b6b;
    height: 100%;
    position: relative;
}
.login_box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    top: 50%;
    left: 50%;
    /* 将当前盒子在横轴上向左移动自身宽度的50%，... */
    transform: translate(-50%,-50%);
}
.avatar_box{
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%,-50%);
}
.avatar_box img{
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
}
.login_form{
    position: absolute;
    width: 100%;
    bottom: 0;
    padding: 0 20px;
    /* 不计算pad和mar的盒子模型 */
    box-sizing: border-box;
    
   
}
.btn{
    display: flex;
    justify-content: flex-end;
}

</style>
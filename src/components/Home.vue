<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主题区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu background-color="#333744" 
        text-color="#fff" 
        active-text-color="#419EFF"
         unique-opened :collapse="isCollapse" 
         :collapse-transition="false"
         router
         :default-active="activepath">
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <template slot="title">
                <!-- i图标 -->
              <i :class="iconsObj[item.id]"></i>
                <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
              <el-menu-item :index="'/'+subitem.path" v-for="subitem in item.children" :key="subitem.id"
              @click="saveNavState('/'+subitem.path)">
                  <i class="el-icon-menu"></i>
                  <span>{{subitem.authName}}</span></el-menu-item>
          </el-submenu>
                   
        </el-menu>
      </el-aside>
      <!-- 右侧主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data(){
    return{
      menulist:[],
      iconsObj:{
        '125':'iconfont icon-users',
        '103':'iconfont icon-tijikongjian',
        '101':'iconfont icon-shangpin' ,
        '102':'iconfont icon-danju',
        '145':'iconfont icon-baobiao'

      },
      isCollapse:false,
      activepath:'',
    }
  },
  created(){
    this.getMenuList()
    this.activepath=window.sessionStorage.getItem('activepath')
   
  },
  methods: {
    //基于 token的方式实现退出比较简单，只需要销毁本地的token即可。
    //这样，后续的请求就不会携带token，必须重新登录生成一个新的 token之后才可以访问页面。
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async getMenuList(){
       const {data :res} = await this.$http.get('menus')
       if(res.meta.status!==200) return this.$message.error(res.meta.msg);
       this.menulist=res.data
       console.log(res)
    },
    //点击按钮折叠菜单
    toggleCollapse(){
      this.isCollapse=!this.isCollapse;

    },
    //保持链接的激活状态
    saveNavState(activepath){
      window.sessionStorage.setItem('activepath',activepath)
       this.activepath=activepath

    }
  },
};
</script>
<style scoped>
.el-header {
  background-color: #363d40;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
}
.el-header div {
  display: flex;
  align-items: center;
}
.el-header div span {
  margin-left: 15px;
}
.el-aside {
  background-color: #313743;
}
.el-aside .el-menu{
  border-right: none;
}
.el-main {
  background-color: #e9edf1;
}
.el-container {
  height: 100%;
}
.toggle-button{
  background-color: #4A5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  /* 字体间距 */
  letter-spacing: 0.2em;
  /* 鼠标移上去有小手 */
  cursor: pointer;
}
</style>
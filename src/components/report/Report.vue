<template>
    <div>
        <!-- 导航 -->
        <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
     <!-- 卡片视图区域 -->
    <el-card>
    <!--2 为 ECharts 准备一个具备大小（宽高）的 DOM -->
    <div id="main" style="width: 760px;height:400px;"></div>
    </el-card>
    </div>
</template>
<script>
//1引入文件
import *as echarts from 'echarts'
import _ from 'lodash'
export default {
    data(){
        return{
            //需要合并数据
         options: {
          title: {
            text: '用户来源'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#E9EEF3'
              }
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              boundaryGap: false
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ]
        }
           

        }
    },
    //此时页面上的Dom元素已经被渲染完毕
    async mounted(){
         // 3基于准备好的dom，初始化echarts实例
         var myChart = echarts.init(document.getElementById('main'));
         const { data: res } = await this.$http.get('reports/type/1')
         if (res.meta.status !== 200) {
             return this.$message.error('获取折线图数据失败！')
             }
         // 4指定图表的配置项和数据
         const result=_.merge(res.data,this.options)
        //5展示数据
        myChart.setOption(result);

    }
    
}
</script>
<style scoped>

</style>
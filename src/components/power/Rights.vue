<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- :data 绑定数据源 -->
            <!-- border 为表格添加竖线 stripe 隔行变色-->
            <el-table :data="rightsList" border stripe>
                <!-- type="index" 索引列 -->
                <el-table-column label="#" type="index"></el-table-column>
                <!-- prop具体对应的属性值 -->
                <el-table-column label="权限名称" prop="authName"></el-table-column>
                <el-table-column label="路径" prop="path"></el-table-column>
                <el-table-column label="权限等级">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.level === '0'">一级</el-tag>
                        <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
                        <el-tag type="warning" v-else>三级</el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 权限列表
            rightsList: []
        }
    },
    // 生命周期函数：组件创建完毕就自动执行
    created() {
        // 获取所有的权限
        this.getRightsList()
    },
    methods: {
        // 获取权限列表
        async getRightsList() {
            // api文档中地址为rights/:type,type为list或tree,这里是list直接写死
            const { data: res } = await this.$http.get('rights/list')
            if (res.meta.status !== 200) {
                return this.$message.error('获取权限列表失败！')
            }
            this.rightsList = res.data
            console.log(this.rightsList)
        }
    }
}
</script>

<style lang="less" scoped></style>
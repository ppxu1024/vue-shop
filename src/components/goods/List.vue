<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- :gutter代表每栏之间的间隔 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <!-- clearable添加清空输入文本框属性 -->
                    <!-- @clear="getGoodsList"点击清空键重新获取全部商品列表 -->
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
                        <!-- 点击搜索按钮获取相关列表@click="getGoodsList" -->
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddpage">添加商品</el-button>
                </el-col>
            </el-row>

            <!-- table表格区域 -->
            <!-- data 数据源  border竖纹边框  stripe隔行变色 -->
            <el-table :data="goodsList" border stripe>
                <!-- 索引行 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格（元）" prop="goods_price" width="105px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
                <el-table-column label="创建时间" prop="add_time" width="140px">
                    <template slot-scope="scope">
                        {{ scope.row.add_time | dateFormat }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="140px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini"
                            @click="showEditGoodsDialog(scope.row.goods_id)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                            @click="removeGoodsById(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <!-- @size-change="handleSizeChange"  pagesize发生变化调用此函数 -->
            <!-- @current-change="handleCurrentChange" 当前页码值发生变化调用此函数 -->
            <!-- background 给分页页码条加一个背景 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total" background>
            </el-pagination>
        </el-card>

        <!-- 修改商品的对话框 -->
        <el-dialog title="修改商品信息" :visible.sync="editGoodsDialogVisible" width="50%" @close="editGoodsDialogClosed">
            <el-form :model="editGoodsForm" :rules="editGoodsFormRules" ref="editGoodsFormRef" label-width="100px">
                <el-form-item label="商品名称" prop="goods_name">
                    <el-input v-model="editGoodsForm.goods_name"></el-input>
                </el-form-item>
                <el-form-item label="商品价格" prop="goods_price">
                    <el-input v-model="editGoodsForm.goods_price" type="number"></el-input>
                </el-form-item>
                <el-form-item label="商品重量" prop="goods_weight">
                    <el-input v-model="editGoodsForm.goods_weight" type="number"></el-input>
                </el-form-item>
                <el-form-item label="商品数量" prop="goods_number">
                    <el-input v-model="editGoodsForm.goods_number" type="number"></el-input>
                </el-form-item>
                <!-- 富文本编辑器组件 -->
                <el-form-item label="商品描述">
                    <quill-editor v-model="editGoodsForm.goods_introduce">
                    </quill-editor>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editGoodsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editGoods">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    // 初始化一些节点
    // 私有数据节点
    data() {
        return {
            // 查询参数对象
            queryInfo: {
                // 查询文本
                query: '',
                pagenum: 1,
                pagesize: 10
            },
            // 商品列表
            goodsList: [],
            // 总数据条数
            total: 0,
            // 控制修改商品信息的对话框的显示与隐藏
            editGoodsDialogVisible: false,
            // 查询到的商品信息对象
            editGoodsForm: {},
            // 修改商品表单的验证规则对象
            editGoodsFormRules: {
                goods_name: [
                    { required: true, message: '请输入商品名称', trigger: 'blur' },
                ],
                goods_price: [
                    { required: true, message: '请输入商品价格', trigger: 'blur' },
                ],
                goods_weight: [
                    { required: true, message: '请输入商品重量', trigger: 'blur' },
                ],
                goods_number: [
                    { required: true, message: '请输入商品数量', trigger: 'blur' },
                ]
            }
        }
    },
    // 生命周期函数
    created() {
        this.getGoodsList()
    },
    // 所有事件函数处理节点
    methods: {
        // 根据分页获取对应的商品列表
        async getGoodsList() {
            const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
            if (res.meta.status !== 200) {
                return this.$message.error('获取商品列表失败！')
            }
            this.$message.success('获取商品列表成功！')
            console.log(res.data)
            this.goodsList = res.data.goods
            this.total = res.data.total
        },
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getGoodsList()
        },
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getGoodsList()
        },
        async removeGoodsById(id) {
            const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            // 确认删除返回'confirm',取消删除返回'cancel'
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }

            const { data: res } = await this.$http.delete(`goods/${id}`)
            console.log(res)
            if (res.meta.status !== 200) {
                return this.$message.error('删除商品失败！')
            }
            this.$message.success('删除商品成功！')
            // 刷新商品列表数据
            this.getGoodsList()
        },
        // 跳转到添加商品页面
        goAddpage() {
            this.$router.push('/goods/add')
        },
        // 展示商品编辑的对话框
        async showEditGoodsDialog(id) {
            const { data: res } = await this.$http.get(`goods/${id}`)
            console.log(res)
            if (res.meta.status !== 200) {
                return this.$message.error('查询商品信息失败！')
            }
            this.editGoodsForm = res.data
            this.editGoodsDialogVisible = true
        },
        // 监听修改商品对话框的关闭事件
        editGoodsDialogClosed() {
            this.$refs.editGoodsFormRef.resetFields()
        },
        // 修改商品信息并提交
        editGoods() {
            this.$refs.editGoodsFormRef.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.put(`goods/${this.editGoodsForm.goods_id}`, {
                    goods_name: this.editGoodsForm.goods_name,
                    goods_price: this.editGoodsForm.goods_price,
                    goods_number: this.editGoodsForm.goods_number,
                    goods_weight: this.editGoodsForm.goods_weight,
                    goods_introduce: this.editGoodsForm.goods_introduce,
                    goods_cat: '200'
                })
                console.log(res)
                if (res.meta.status !== 200) {
                    return this.$message.error('修改商品失败！')
                }
                this.$message.success('修改商品成功！')
                this.getGoodsList()
                this.editGoodsDialogVisible = false
            })
        }
    }
}
</script>

<style lang="less" scoped></style>
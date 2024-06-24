<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- el-row 行 el-col 列 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>

            <!-- 表格区域 -->
            <!-- data数据源 -->
            <!-- :selection-type="false"去除复选框，false为bool值，前面需要加:属性绑定 -->
            <!-- :expand-type="false"去除展开行效果 -->
            <!-- 如果要把某属性重置为true，直接写属性名即可 -->
            <!-- show-index 显示索引 index-text 修改索引列名称 -->
            <!-- border 添加纵向分割线 -->
            <!-- show-row-hover去除高亮效果 -->
            <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false"
                :expand-type="false" show-index index-text="#" border :show-row-hover="false">
                <!-- 是否有效 -->
                <!-- 在表格内部定义了一个插槽，名字叫做isok -->
                <!-- 用scope接收这一行的数据 -->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:#14a5af;"></i>
                    <i class="el-icon-error" v-else style="color:red;"></i>
                </template>

                <!-- 排序 -->
                <template slot="order" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                    <el-tag type="warning" size="mini" v-else>三级</el-tag>
                </template>

                <!-- 操作 -->
                <template slot="opt" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini"
                        @click="showEditCateDialog(scope.row.cat_id)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini"
                        @click="removeCateById(scope.row.cat_id)">删除</el-button>
                </template>
            </tree-table>
            <!-- 分页区域 -->
            <!-- @size-change="handleSizeChange" 每页显示多少条数据的改变 -->
            <!-- @current-change="handleCurrentChange" 当前页码值的改变事件 -->
            <!-- :current-page="queryInfo.pagenum" 当前渲染的页面 -->
            <!-- :page-sizes 每页显示多少条数据的可选值 -->
            <!-- :page-size 当前显示多少条数据 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>

            <!-- 添加分类的对话框 -->
            <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
                <!-- 添加分类的表单 -->
                <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
                    <el-form-item label="分类名称：" prop="cat_name">
                        <el-input v-model="addCateForm.cat_name"></el-input>
                    </el-form-item>
                    <!-- 父级分类没有验证规则，删除prop -->
                    <el-form-item label="父级分类：">
                        <!-- 级联选择器（默认只允许选择最后一级选项） -->
                        <!-- options指定数据源 -->
                        <!-- props用来指定配置对象 -->
                        <!-- value将选中的值双向绑定到data中（必须是数组） -->
                        <!-- @change="parentCateChange"选择项发生变化触发这个函数 -->
                        <!-- clearable支持清空选项 -->
                        <el-cascader :options="parentCateList" :props="cascaderProps" v-model="selectedKeys"
                            @change="parentCateChange" clearable>
                        </el-cascader>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addCateDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addCate">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 修改分类的对话框 -->
            <el-dialog title="修改分类" :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClosed">
                <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
                    <el-form-item label="分类名称" prop="cat_name">
                        <el-input v-model="editCateForm.cat_name"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editCateDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editCateInfo">确 定</el-button>
                </span>
            </el-dialog>

        </el-card>
    </div>
</template>

<script>
export default {
    // 预定义data私有数据节点
    data() {
        return {
            // 根据API接口文档指定查询条件
            queryInfo: {
                // 获取三层数据
                type: 3,
                // 当前页码值
                pagenum: 1,
                // 每页显示多少条数据
                pagesize: 5
            },
            // 商品分类的数据列表，默认为空
            cateList: [],
            // 总数据条数
            total: 0,
            // 为table指定列的定义
            columns: [
                {
                    label: '分类名称',
                    prop: 'cat_name'
                },
                {
                    label: '是否有效',
                    // 表示将当前列定义为模板列
                    type: 'template',
                    // 表示当前这一列使用的模板名称
                    template: 'isok'
                },
                {
                    label: '排序',
                    // 表示将当前列定义为模板列
                    type: 'template',
                    // 表示当前这一列使用的模板名称
                    template: 'order'
                },
                {
                    label: '操作',
                    // 表示将当前列定义为模板列
                    type: 'template',
                    // 表示当前这一列使用的模板名称
                    template: 'opt'
                }
            ],
            // 控制添加分类对话框的显示与隐藏
            addCateDialogVisible: false,
            // 添加分类的表单数据对象
            addCateForm: {
                // 将要添加的分类名称
                cat_name: '',
                // 父级分类的id
                cat_pid: 0,
                // 当前分类的等级，默认要添加的是一级分类 
                cat_level: 0
            },
            // 添加分类表单的验证规则对象
            addCateFormRules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' }
                ]
            },
            // 父级分类的列表
            parentCateList: [],
            // 指定级联选择器的配置对象
            cascaderProps: {
                // expandTrigger: 'hover'通过鼠标覆盖来展开子菜单
                expandTrigger: 'hover',
                // 实际选中属性
                value: 'cat_id',
                // 看到的属性
                label: 'cat_name',
                // 父子嵌套用的属性
                children: 'children',
                // 级联选择器默认只允许选择最后一级选项，checkStrictly允许它选中任何一项
                checkStrictly: true
            },
            // 选中的父级分类的id数组
            selectedKeys: [],
            // 控制修改分类对话框的显示与隐藏
            editCateDialogVisible: false,
            // 查询到的分类信息对象
            editCateForm: {},
            // 修改分类的表单验证规则对象
            editCateFormRules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' }
                ]
            }
        }
    },
    // 生命周期函数
    created() {
        this.getCateList()
    },
    // 定义所有事件处理函数
    methods: {
        // 获取商品分类数据
        async getCateList() {
            const { data: res } = await this.$http.get('categories', { params: this.queryInfo })

            if (res.meta.status !== 200) {
                return this.$http.error('获取商品分类失败！')
            }
            console.log(res.data)
            // 把数据列表赋值给cateList
            this.cateList = res.data.result
            // 为总数据条数赋值
            this.total = res.data.total

        },
        // 监听pagesize改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            // 刷新数据列表
            this.getCateList()
        },
        // 监听pagenum的改变
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            // 刷新数据列表
            this.getCateList()
        },
        // 点击按钮，展示添加分类的对话框
        showAddCateDialog() {
            // 先获取父级分类的数据列表
            this.getParentCateList()
            // 再展示出对话框
            this.addCateDialogVisible = true
        },
        // 获取父级分类的数据列表
        async getParentCateList() {
            // type:2只获取前两级数据即可
            const { data: res } = await this.$http.get('categories', {
                params:
                    { type: 2 }
            })
            if (res.meta.status !== 200) {
                return this.$message.error('获取父级分类数据失败！')
            }
            // console.log(res.data)
            this.parentCateList = res.data
        },
        // 选择项发生变化触发这个函数
        // 默认添加的分类是一级，如果选择了父级分类，需要随之更新添加分类的等级
        parentCateChange() {
            console.log(this.selectedKeys)
            // 如果selectedKeys数组中的length大于0，证明选中了父级分类
            // 反之，就说明没有选中任何父级分类
            if (this.selectedKeys.length > 0) {
                // 父级分类的id,永远选择最后一项作为父级id
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                // 为当前分类的等级赋值
                this.addCateForm.cat_level = this.selectedKeys.length
                return
            } else {
                // 未选择父级分类，将父级分类id和等级全部重置为0
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0
            }
        },
        // 点击按钮，添加新的分类
        addCate() {
            console.log(this.addCateForm)
            // 拿到表单的引用进行预验证
            this.$refs.addCateFormRef.validate(async valid => {
                // 预校验失败直接return
                if (!valid) return
                const { data: res } = await this.$http.post('categories', this.addCateForm)
                if (res.meta.status !== 201) {
                    return this.$message.error('添加分类失败！')
                }
                this.$message.success('添加分类成功！')
                // 刷新数据列表
                this.getCateList()
                // 隐藏添加分类的对话框
                this.addCateDialogVisible = false
            })
        },
        // 监听添加分类对话框的关闭事件，重置表单数据
        addCateDialogClosed() {
            // 重置表单只清空了分类名称
            this.$refs.addCateFormRef.resetFields()
            // 还需要重置父级分类
            this.selectedKeys = []
            this.addCateForm.cat_level = 0
            this.addCateForm.cat_pid = 0
        },
        // 展示修改分类信息的对话框，根据id查询分类信息
        async showEditCateDialog(id) {
            const { data: res } = await this.$http.get('categories/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error('查询分类信息失败！')
            }
            this.editCateForm = res.data
            this.editCateDialogVisible = true
        },
        // 监听修改分类对话框的关闭事件——进行表单重置
        editCateDialogClosed() {
            this.$refs.editCateFormRef.resetFields()
        },
        // 修改分类信息并提交
        editCateInfo() {
            // 先进行预校验操作
            this.$refs.editCateFormRef.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, {
                    cat_name: this.editCateForm.cat_name
                })
                console.log(res)
                if (res.meta.status !== 200) {
                    return this.$message.error('更新分类信息失败！')
                }
                this.$message.success('更新分类信息成功！')
                this.getCateList()
                this.editCateDialogVisible = false
            })
        },
        // 根据id删除对应的分类信息
        async removeCateById(id) {
            const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            // 如果用户确认删除，则返回值为字符串"confirm"
            // 如果用户取消了删除，则返回值为字符串"cancel"
            // console.log(confirmResult)
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            const { data: res } = await this.$http.delete('categories/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error('删除分类失败！')
            }
            this.$message.success('删除分类成功！')
            this.getCateList()
        }
    }
} 
</script>


<style lang="less" scoped>
.treeTable {
    margin-top: 15px;
}

// 使级联选择器宽度占满
.el-cascader {
    width: 100%;
}
</style>
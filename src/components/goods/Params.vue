<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 头部的警告区域 -->
            <!-- :closable="false"设置不可关闭 -->
            <!-- show-icon 展示默认图标 -->
            <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false">
            </el-alert>

            <!-- 选择商品分类区域 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 选择商品分类的级联选择框 -->
                    <!-- :options指定数据源 -->
                    <!-- props用来指定配置对象 -->
                    <!-- v-model="selectedCateKeys" 级联选择框双向绑定到的数组 -->
                    <!-- @change="handleChange" 选择项发生变化触发这个函数 -->
                    <el-cascader v-model="selectedCateKeys" :options="cateList" :props="cateProps"
                        @change="handleChange">
                    </el-cascader>
                </el-col>
            </el-row>

            <!-- tab 页签区域 -->
            <!-- @tab-click="handleTabClick"点击页签触发的事件 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!-- 添加动态参数的面板 -->
                <!-- 这个name根据API文档改的，可直接用于请求参数sel -->
                <el-tab-pane label="动态参数" name="many">
                    <!-- 添加参数的按钮 -->
                    <!-- disabled是否禁用按钮的属性 -->
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled"
                        @click="addDialogVisible = true">添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTableData">
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- 循环渲染tag标签 -->
                                <!-- closable添加可清除属性 -->
                                <!-- @close="handleClose(i)"绑定删除tag事件 -->
                                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable
                                    @close="handleClose(i, scope.row)">{{ item }}</el-tag>
                                <!-- 输入文本框 -->
                                <!-- @keyup.enter.native按下Enter键触发事件 -->
                                <!-- @blur鼠标失去焦点触发事件 -->
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <!-- 添加按钮 -->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+
                                    New
                                    Tag</el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini"
                                    @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini"
                                    @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!-- 添加静态属性的面板 -->
                <el-tab-pane label="静态属性" name="only">
                    <!-- 添加属性的按钮 -->
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled"
                        @click="addDialogVisible = true">添加属性</el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyTableData">
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- 循环渲染tag标签 -->
                                <!-- closable添加可清除属性 -->
                                <!-- @close="handleClose(i)"绑定删除tag事件 -->
                                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable
                                    @close="handleClose(i, scope.row)">{{ item }}</el-tag>
                                <!-- 输入文本框 -->
                                <!-- @keyup.enter.native按下Enter键触发事件 -->
                                <!-- @blur鼠标失去焦点触发事件 -->
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <!-- 添加按钮 -->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+
                                    New
                                    Tag</el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini"
                                    @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini"
                                    @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 添加参数的对话框 -->
        <!-- 由于titleText是一个动态值，需要在前面加:做动态数据绑定 -->
        <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <!-- 添加参数的表单 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改参数的对话框 -->
        <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <!-- 添加参数的表单 -->
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
export default {
    data() {
        return {
            cateList: [],
            // 级联选择框的配置对象
            cateProps: {
                // expandTrigger: 'hover'通过鼠标覆盖来展开子菜单
                expandTrigger: 'hover',
                // 选中值
                value: 'cat_id',
                // 看到的值
                label: 'cat_name',
                // 指定父子节点的嵌套属性
                children: 'children'
            },
            // 级联选择框双向绑定到的数组
            selectedCateKeys: [],
            // 被激活的页签的名称
            activeName: 'many',
            // 动态参数的数据
            manyTableData: [],
            // 静态属性的数据
            onlyTableData: [],
            // 控制添加对话框的显示与隐藏
            addDialogVisible: false,
            // 添加参数的表单数据对象
            addForm: {
                attr_name: ''
            },
            // 添加表单的验证规则对象
            addFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
            },
            // 控制修改对话框的显示与隐藏
            editDialogVisible: false,
            // 修改的表单数据对象
            editForm: {},
            // 修改表单的验证规则对象
            editFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
            }
        }
    },
    created() {
        this.getCateList()
    },
    methods: {
        // 获取所有商品分类列表数据
        async getCateList() {
            const { data: res } = await this.$http.get('categories')
            if (res.meta.status !== 200) {
                return this.$http.error('获取商品分类失败！')
            }
            this.cateList = res.data
            console.log(this.cateList)
        },
        // 属于级联选择器，只有级联选择框选中项变化，才会触发这个函数
        handleChange() {
            this.getParamsData()
        },
        // tab页签点击事件的处理函数
        handleTabClick() {
            console.log(this.activeName)
            this.getParamsData()
        },
        // 获取参数的列表数据
        async getParamsData() {
            // 证明选中的不是三级分类
            if (this.selectedCateKeys.length !== 3) {
                // 将id数组清空
                this.selectedCateKeys = []
                // 把不是三级分类的Table都清空
                this.manyTableData = []
                this.onlyTableData = []
                return
            }
            // 证明选中的是三级分类
            console.log(this.selectedCateKeys)
            // 根据所选分类的id和当前所处的面板获取对应的参数
            const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
                params: { sel: this.activeName }
            })
            if (res.meta.status !== 200) {
                return this.$message.error('获取参数列表失败！')
            }
            // 本来是字符串，经过下面的循环变成数组
            res.data.forEach(item => {
                // 判断item.attr_vals字符串是否为空，不为空分割，为空直接返回空数组
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
                // 控制文本框的显示与隐藏
                item.inputVisible = false
                // 文本框中输入的值
                item.inputValue = ''
            })
            console.log(res.data)
            // 判断是哪个参数方便后面渲染不同的Table
            // 动态参数
            if (this.activeName === "many") {
                this.manyTableData = res.data
                // 静态属性
            } else {
                this.onlyTableData = res.data
            }
        },
        // 监听对话框的关闭事件
        addDialogClosed() {
            // 重置对话框
            this.$refs.addFormRef.resetFields()
        },
        // 点击按钮添加参数
        addParams() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
                    attr_name: this.addForm.attr_name,
                    attr_sel: this.activeName
                })
                if (res.meta.status !== 201) {
                    return this.$message.error('添加参数失败！')
                }
                this.$message.success('添加参数成功！')
                this.addDialogVisible = false
                this.getParamsData()
            })
        },
        // 点击按钮展示修改对话框
        async showEditDialog(attrId) {
            // 查询当前参数的信息
            const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, {
                params: {
                    attr_sel: this.activeName
                }
            })
            if (res.meta.status !== 200) {
                return this.$message.error('获取参数信息失败！')
            }
            this.editForm = res.data
            this.editDialogVisible = true
        },
        // 监听修改对话框的关闭事件
        editDialogClosed() {
            // 重置表单
            this.$refs.editFormRef.resetFields()
        },
        // 点击按钮修改参数信息
        editParams() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
                    attr_name: this.editForm.attr_name,
                    attr_sel: this.activeName
                })
                if (res.meta.status !== 200) {
                    return this.$message.error('修改参数失败！')
                }
                this.$message.success('修改参数成功！')
                this.getParamsData()
                this.editDialogVisible = false
            })
        },
        // 根据id删除对应参数项
        async removeParams(attrId) {
            // 弹框提示用户
            const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            // 用户取消了删除的操作
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除！')
            }
            // 删除的业务逻辑
            const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
            if (res.meta.status !== 200) {
                return this.$message.error('删除参数失败！')
            }
            this.$message.success('删除参数成功！')
            this.getParamsData()
        },
        // 文本框失去焦点，或按下Enter都会触发
        async handleInputConfirm(row) {
            // str.trim()去除字符串两端空格(防止前后有空格)
            if (row.inputValue.trim().length === 0) {
                row.inputValue = ''
                row.inputVisible = false
                return
            }
            // 如果没有return，则证明输入的内容需要做后续处理  
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ''
            row.inputVisible = false
            this.saveAttrVals(row)
        },
        // 将对attr_vals的操作保存到数据库
        async saveAttrVals(row) {
            // 需要发起请求，保存这次操作
            const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
                attr_name: row.attr_name,
                attr_sel: row.attr_sel,
                attr_vals: row.attr_vals.join(' ')
            })
            if (res.meta.status !== 200) {
                return this.$message.error('修改参数项失败！')
            }
            this.$message.success('修改参数项成功！')
        },
        // 点击按钮展示文本输入框
        showInput(row) {
            row.inputVisible = true
            // 当布尔值被重置为true后，页面上的元素还未重新渲染，也就是页面上展示的仍是button按钮，并不是文本框，需要等一个时机

            // 让文本框自动获得焦点
            // $nextTick方法作用：就是当页面上元素被重新渲染之后，才会执行回调函数中的代码
            // eslint-disable-next-line no-unused-vars
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        // 删除对应的参数可选项
        handleClose(i, row) {
            // 从i开始删除1项
            row.attr_vals.splice(i, 1)
            this.saveAttrVals(row)
        }
    },
    // 计算属性：通过计算得到一个属性值(必须有return)
    computed: {
        // 如果按钮需要被禁用，则返回true，否则返回false
        // 得到布尔值
        isBtnDisabled() {
            if (this.selectedCateKeys.length !== 3) {
                return true
            }
            return false
        },
        // 当前选中的三级分类的id，取数组最后一项即可
        cateId() {
            if (this.selectedCateKeys.length === 3) {
                return this.selectedCateKeys[2]
            }
            return null
        },
        // 动态计算标题的文本
        titleText() {
            if (this.activeName === "many") {
                return '动态参数'
            }
            return '静态属性'
        }
    }
}
</script>

<!-- scoped 防止组件之间出现样式冲突问题 -->
<!-- scoped 只在当前节点下生效，去除则全局生效 -->
<style lang="less" scoped>
.cat_opt {
    // 上下15px,左右0
    margin: 15px 0;
}

.el-tag {
    margin: 10px;
}

.input-new-tag {
    width: 120px;
}
</style>
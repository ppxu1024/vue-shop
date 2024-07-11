<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 添加角色按钮区域 -->
            <el-row>
                <el-col>
                    <!-- 给添加角色按钮绑定单击事件 使addRoleDialogVisible = true -->
                    <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>

            <!-- 角色列表区域 -->
            <!-- :data 绑定数据源 border 边框线 stripe 隔行变色-->
            <el-table :data="rolesList" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <!-- i1是索引 -->
                        <!-- :class="['bdbottom']" 动态绑定一个类是每一行增加底边框 -->
                        <!-- i1 === 0 ? 'bdtop' : ''如果索引为0增加顶边框，否则不加 -->
                        <el-row :class="['expandPadding', 'bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
                            v-for="(item1, i1) in scope.row.children" :key="item1.id">
                            <!-- 渲染一级权限 :span="5"占5列-->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row, item1.id)">
                                    {{ item1.authName }}
                                </el-tag>
                                <!-- 右箭头图标 -->
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级和三级权限 :span="19"占19列-->
                            <el-col :span="19">
                                <!-- 通过for循环嵌套渲染二级权限 -->
                                <!-- i2是索引 -->
                                <!-- :class="[i2 === 0 ? '' : 'bdtop']"动态绑定类名，索引不为0增加顶边框 -->
                                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                                    v-for="(item2, i2) in item1.children" :key="item2.id">
                                    <!-- 左边二级权限 :span="6"占6列 -->
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">
                                            {{ item2.authName }}
                                        </el-tag>
                                        <!-- 右箭头图标 -->
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <!-- 右边三级权限 -->
                                    <el-col :span="18">
                                        <!-- 设置closable属性可以定义一个标签是否可移除 -->
                                        <!-- removeRightById(scope.row,item3.id)通过角色id和权限id删除权限函数 -->
                                        <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable
                                            @close="removeRightById(scope.row, item3.id)">
                                            {{ item3.authName }}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                        <!-- <pre>
                            {{ scope.row }}
                        </pre> -->
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <!-- 要用到作用域插槽，去除prop -->
                <!-- 三个图标按钮需要在一行显示，强制添加一个宽度 -->
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit"
                            @click="showEditRoleDialog(scope.row.id)">编辑</el-button>
                        <!-- removeRoleById(scope.row.id)通过角色id删除角色函数 -->
                        <el-button size="mini" type="danger" icon="el-icon-delete"
                            @click="removeRoleById(scope.row.id)">删除</el-button>
                        <!-- showSetRightDialog展示分配权限的对话框 -->
                        <el-button size="mini" type="warning" icon="el-icon-setting"
                            @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 添加角色的对话框 -->
        <!-- title 对话框标题 -->
        <!-- :visible.sync 控制对话框的显示和隐藏，绑定到一个布尔值身上 -->
        <!-- width="50%"对话框宽度占屏幕宽度一半 -->
        <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%" @close="addRoleDialogClosed">
            <!-- 内容主体区域 -->
            <!-- :model 数据绑定对象 -->
            <!-- :rules="addRoleFormRules" 验证规则对象 -->
            <!-- ref 引用对象 -->
            <!-- label-width 指定文本框之前文本所占宽度 -->
            <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="70px">
                <!-- prop 验证规则的属性，在addRoleFormRules中作具体定义 -->
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addRoleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addRoleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRole">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改角色的对话框 -->
        <el-dialog title="修改角色" :visible.sync="editRoleDialogVisible" width="50%" @close="editRoleDialogClosed">
            <!-- 内容主体区域 -->
            <!-- :model 数据绑定对象 -->
            <!-- :rules="editRoleFormRules" 验证规则对象 -->
            <!-- ref 引用对象 -->
            <!-- label-width 指定文本框之前文本所占宽度 -->
            <el-form :model="editRoleForm" :rules="editRoleFormRules" ref="editRoleFormRef" label-width="70px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editRoleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editRoleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="editRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRoleInfo">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 分配权限的对话框 -->
        <!-- @close="setRightDialogClosed"关闭对话框需要清空数据 -->
        <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
            <!-- 树形控件 -->
            <!-- :data指定数据源 -->
            <!-- :props为整棵树指定数据绑定字段 -->
            <!-- show-checkbox 在每个节点前添加复选框 -->
            <!-- node-key="id"表示只要选中某节点，那么就是选中了该节点的id值 -->
            <!-- default-expand-all 希望为ture，默认展开所有节点 -->
            <!-- :default-checked-keys="defKeys"默认勾选defKeys中id对应的节点 -->
            <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all
                :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 所有角色列表数据
            rolesList: [],
            // 控制添加角色对话框的显示与隐藏
            addRoleDialogVisible: false,
            // 添加角色的表单数据
            addRoleForm: {
                roleName: '',
                roleDesc: ''
            },
            // 添加角色的表单验证规则
            addRoleFormRules: {
                roleName: [
                    // trigger: 'blur' 出发验证的时机，失去焦点时触发这次验证行为
                    { required: true, message: '请输入角色名', trigger: 'blur' }, {
                        min: 3,
                        max: 10,
                        message: '角色名的长度在3~10个字符之间', trigger: 'blur'
                    }
                ],
                roleDesc: [
                    // trigger: 'blur' 出发验证的时机，失去焦点时触发这次验证行为
                    { required: true, message: '请输入角色描述', trigger: 'blur' }
                ]
            },
            // 控制修改角色对话框的显示与隐藏
            editRoleDialogVisible: false,
            // 查询到的角色信息对象
            editRoleForm: {},
            // 修改角色的表单验证规则对象
            editRoleFormRules: {
                roleName: [
                    // trigger: 'blur' 出发验证的时机，失去焦点时触发这次验证行为
                    { required: true, message: '请输入角色名', trigger: 'blur' }, {
                        min: 3,
                        max: 10,
                        message: '角色名的长度在3~10个字符之间', trigger: 'blur'
                    }
                ],
                roleDesc: [
                    // trigger: 'blur' 出发验证的时机，失去焦点时触发这次验证行为
                    { required: true, message: '请输入角色描述', trigger: 'blur' }
                ]
            },
            // 控制分配权限对话框的显示与隐藏
            setRightDialogVisible: false,
            // 所有权限的数据
            rightsList: [],
            // 树形控件的属性绑定对象：显示文本+实现父子嵌套的属性
            treeProps: {
                label: 'authName',
                children: 'children'
            },
            // 默认选中的节点Id值数组
            defKeys: [],
            // 当前即将分配权限的角色id
            roleId: ''
        }
    },
    created() {
        // 在这个生命周期函数中获取所有角色列表数据
        this.getRolesList()
    },
    methods: {
        // 获取所有角色的列表
        async getRolesList() {
            const { data: res } = await this.$http.get('roles')
            if (res.meta.status !== 200) {
                return this.$message.error('获取角色列表失败！')
            }
            this.rolesList = res.data
            console.log(this.rolesList)
        },
        // 监听添加角色对话框的关闭事件
        addRoleDialogClosed() {
            // 关闭表单后重置表单
            this.$refs.addRoleFormRef.resetFields()
        },
        // 点击按钮，添加新角色
        addRole() {
            this.$refs.addRoleFormRef.validate(async valid => {
                // 添加角色前的表单预校验
                // 预校验不成功直接return
                if (!valid) return
                // 预校验成功
                const { data: res } = await this.$http.post('roles', this.addRoleForm)
                if (res.meta.status !== 201) {
                    return this.$message.error('添加角色失败！')
                }
                // 发起请求成功，三步操作
                this.$message.success('添加角色成功！')
                // 关闭添加角色的对话框
                this.addRoleDialogVisible = false
                // 更新角色列表数据
                this.getRolesList()
            })
        },
        // 展示修改角色的对话框，根据id修改
        async showEditRoleDialog(id) {
            console.log(typeof id)
            // 首先根据id查询对应角色以显示在对话框中
            const { data: res } = await this.$http.get('roles/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error('查询角色信息失败！')
            }
            this.editRoleForm = res.data
            this.editRoleDialogVisible = true
        },
        // 监听修改角色对话框的关闭事件
        editRoleDialogClosed() {
            this.$refs.editRoleFormRef.resetFields()
        },
        // 修改角色信息并提交
        editRoleInfo() {
            // 预校验
            this.$refs.editRoleFormRef.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.put('roles/' + this.editRoleForm.roleId, {
                    roleName: this.editRoleForm.roleName,
                    roleDesc: this.editRoleForm.roleDesc
                })
                console.log(res)
                if (res.meta.status !== 200) {
                    return this.$message.error('更新角色信息失败！')
                }
                this.editRoleDialogVisible = false
                this.getRolesList()
                this.$message.success('更新角色信息成功！')
            })
        },
        // 根据id删除对应的角色信息
        async removeRoleById(id) {
            // 弹框询问用户是否删除数据
            const confirmResult = await this.$confirm('此操作将永久删除该角色，是否继续？', '提示',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
                // 通过.catch捕获取消行为
            ).catch(err => err)
            // 如果用户确认删除，则返回值为字符串"confirm"
            // 如果用户取消了删除，则返回值为字符串"cancel"
            // console.log(confirmResult)
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            const { data: res } = await this.$http.delete('roles/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error('删除用户失败！')
            }
            this.$message.success('删除用户成功！')
            this.getRolesList()
        },
        // 根据id删除对应的权限
        async removeRightById(role, rightId) {
            // 弹框提示用户是否要删除
            const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            if (confirmResult !== 'confirm') {
                return this.$message.info('取消了删除权限！')
            }

            const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
            if (res.meta.status !== 200) {
                return this.$message.error('删除权限失败！')
            }
            // 为了防止删除权限后展开项关上，不建议调用以下函数，因为会发生页面的完整渲染
            // this.getRolesList()
            // 为当前角色信息重新赋值权限
            role.children = res.data
        },
        // 展示分配权限的对话框
        async showSetRightDialog(role) {
            // 获取当前分配权限的角色id
            this.roleId = role.id
            // 获取所有权限数据(渲染成树形结构)
            const { data: res } = await this.$http.get('rights/tree')
            if (res.meta.status !== 200) {
                return this.$message.error('获取权限数据失败！')
            }
            // 把获取到的权限数据保存到data中
            this.rightsList = res.data
            console.log(this.rightsList)
            // 递归获取三级节点的id
            this.getLeafKeys(role, this.defKeys)
            // 再展示树形结构
            this.setRightDialogVisible = true
        },
        // 通过递归的形式，获取角色下所有三级权限的id，并保存到defKays数组中
        getLeafKeys(node, arr) {
            // 先判断当前节点是否是三级节点
            // 如果当前node节点不包含children属性，则是三级节点
            if (!node.children) {
                return arr.push(node.id)
            }
            // 不是三级节点需要递归获取三级节点
            node.children.forEach(item => this.getLeafKeys(item, arr))
        },
        // 监听分配权限对话框的关闭事件
        setRightDialogClosed() {
            // 为defKeys重新赋值，防止数据一直叠加
            this.defKeys = []
        },
        // 点击为角色分配权限
        async allotRights() {
            const keys = [
                // 通过展开运算符（...）取出可遍历值放到当前数组中
                // getCheckedKeys()返回包含全勾选节点的数组
                // getHalfCheckedKeys()返回包含半勾选节点的数组
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]
            // console.log(keys)
            // 形成以","拼接的字符串
            const idStr = keys.join(',')
            const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
            if (res.meta.status !== 200) {
                return this.$message.error('更新权限失败！')
            }
            this.$message.success('分配权限成功！')
            // 更新权限列表
            this.getRolesList()
            // 分配成功后关闭对话框
            this.setRightDialogVisible = false
        }
    }
}
</script>

<style lang="less" scoped>
.expandPadding {
    padding-left: 48px;
}

.el-tag {
    margin: 7px;
}

.bdtop {
    border-top: 1px solid #eee;
}

.bdbottom {
    border-bottom: 1px solid #eee;
}

// 纵向上的居中对齐
.vcenter {
    display: flex;
    align-items: center;
}
</style>
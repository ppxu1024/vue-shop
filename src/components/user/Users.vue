<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索与添加区域 -->
            <!-- el-row每一行，el-col每一列 -->
            <!-- :gutter代表每栏之间的间隔 -->
            <el-row :gutter="20">
                <!-- :span="8"代表该列占用长度  -->
                <el-col :span="8">
                    <!-- clearable可清空输入框文本,@clear是在点击clearable时触发的事件 -->
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <!-- 给添加用户按钮绑定单击事件 使addDialogVisible = true -->
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row> <!-- 用户列表区域 -->
            <!-- :data指定数据源 border添加表格的竖直方向边框（默认有横线） stripe 隔行变色-->
            <el-table :data="userlist" border stripe>
                <!-- 添加索引列 -->
                <el-table-column label="#" type="index"></el-table-column>
                <!-- label 列名 prop 对应值 -->
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <!-- mg_state是布尔值无法直接在页面渲染，需要渲染成开关模式，由于作用域插槽会覆盖prop，此处可删除prop -->
                <el-table-column label="状态">
                    <!-- 通过作用域插槽接收一下scope即当前作用域的数据，通过scope点出来row这个属性 -->
                    <!-- scope.row代表这一行数据 -->
                    <template slot-scope="scope">
                        <!-- {{ scope.row }} -->
                        <!-- v-model双向数据绑定 -->
                        <!-- 事件用@定义 -->
                        <!-- 调用userStateChanged函数可传递当前用户信息 -->
                        <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <!-- 给template定义一个属性slot-scope,接收一下作用域插槽这个数据scope -->
                    <!-- 通过scope.row获取到这一行对应数据 -->
                    <template slot-scope="scope">
                        <!-- {{ scope.row }} -->
                        <!-- 修改按钮 -->
                        <!-- size表示图标大小 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini"
                            @click="showEditDialog(scope.row.id)"></el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                            @click="removeUserById(scope.row.id)"></el-button>
                        <!-- 分配角色按钮 -->
                        <!-- effect="dark"代表黑色背景色 placement代表提示文字位置 :enterable="false"表示鼠标不能可以进入tooltip中，也就是提示文本框可自动隐藏-->
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini"
                                @click="setRole(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <!-- @size-change 切换每页显示多少条 -->
            <!-- @current-change 页码值发生变化就会触发此事件 -->
            <!-- current-page 当前显示的是第几页的数据 -->
            <!-- page-sizes 每页显示多少条数据 -->
            <!-- page-size 当前情况下每页显示多少条数据 -->
            <!-- layout 指定页面上需要展示哪些功能组件 -->
            <!-- total 当前有多少条数据 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加用户的对话框 -->
        <!-- title 对话框标题 -->
        <!-- :visible.sync 控制对话框的显示和隐藏，绑定到一个布尔值身上 -->
        <!-- width="50%"对话框宽度占屏幕宽度一半 -->
        <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <!-- 内容主体区域 -->
            <!-- :model 数据绑定对象 -->
            <!-- :rules="addFormRules" 验证规则对象 -->
            <!-- ref 引用对象 -->
            <!-- label-width 指定文本框之前文本所占宽度 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                <!-- prop 验证规则的属性，在addFormRules中作具体定义 -->
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

        <!-- 修改用户的对话框 -->
        <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                <!-- 用户名不可更改，不需要校验规则，disabled处于禁用状态 -->
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserInfo">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 分配角色的对话框 -->
        <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
            <div>
                <!-- 通过插值表达式进行渲染 -->
                <p>当前的用户：{{ userInfo.username }}</p>
                <p>当前的角色：{{ userInfo.role_name }}</p>
                <p>分配新角色：
                    <el-select v-model="selectedRoleId" placeholder="请选择">
                        <!-- label看到的选项文本 value实际选中的选项 -->
                        <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
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
    // 代表当前组件的私有数据
    data() {
        // 通过var定义变量的方式定义验证邮箱的规则(rule,value待校验的value值,cb回调函数)
        var checkEmail = (rule, value, cb) => {
            // 验证邮箱的正则表达式
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
            if (regEmail.test(value)) {
                // 合法的邮箱
                return cb()
            }
            cb(new Error('请输入合法的邮箱'))
        }

        // 验证手机号的规则
        var checkMobile = (rule, value, cb) => {
            // 验证手机号的正则表达式
            const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
            if (regMobile.test(value)) {
                // 合法的手机号
                return cb()
            }
            cb(new Error('请输入合法的手机号'))
        }

        return {
            // 获取用户列表的参数对象
            queryInfo: {
                // 搜索关键字
                query: '',
                // 当前的页数
                pagenum: 1,
                // 当前每页显示多少条数据
                pagesize: 2
            },
            userlist: [],
            total: 0,
            // 控制添加用户对话框的显示与隐藏
            addDialogVisible: false,
            // 添加用户的表单数据
            addForm: {
                username: '',
                password: '',
                email: '',
                mobile: ''
            },
            // 添加用户的表单的验证规则对象
            addFormRules: {
                username: [
                    // trigger: 'blur' 出发验证的时机，失去焦点时触发这次验证行为
                    { required: true, message: '请输入用户名', trigger: 'blur' }, {
                        min: 3,
                        max: 10,
                        message: '用户名的长度在3~10个字符之间', trigger: 'blur'
                    }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' }, {
                        min: 6,
                        max: 15,
                        message: '密码的长度在6~15个字符之间', trigger: 'blur'
                    }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    // 通过validator指定具体校验规则
                    { validator: checkEmail, trigger: 'blur' }
                ],
                mobile: [
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ]
            },
            // 控制修改用户对话框的显示与隐藏
            editDialogVisible: false,
            // 查询到的用户信息对象
            editForm: {},
            // 修改表单的验证规则对象
            editFormRules: {
                email: [
                    { required: true, message: '请输入用户邮箱', trigger: 'blur' },
                    // 通过validator指定具体校验规则
                    { validator: checkEmail, trigger: 'blur' }
                ],
                mobile: [
                    { required: true, message: '请输入用户手机号', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ]
            },
            // 控制分配角色对话框的显示与隐藏
            setRoleDialogVisible: false,
            // 需要被分配角色的用户信息
            userInfo: {},
            // 所有角色的数据列表
            rolesList: [],
            // 已选中的角色Id值
            selectedRoleId: ''
        }
    },
    // 生命周期函数
    created() {
        // 发起当前组件的首屏数据请求
        this.getUserList()
    },
    // 当前组件的一些事件处理函数
    methods: {
        // 由于返回promise对象，使用async、await优化操作
        // 用到await得到一个数据对象，对其进行解构
        async getUserList() {
            const { data: res } = await this.$http.get('users', { params: this.queryInfo })
            if (res.meta.status !== 200) {
                return this.$message.error('获取用户列表失败！')
            }
            // 如果数据获取成功，进行data数据赋值操作
            this.userlist = res.data.users
            this.total = res.data.total
            console.log(res)
        },
        // 监听pagesize改变的事件
        // 只要pagesize发生改变，重新发起一次数据请求
        handleSizeChange(newSize) {
            // console.log(newSize)
            this.queryInfo.pagesize = newSize
            // 重新获取数据
            this.getUserList()
        },
        // 监听页码值改变的事件
        handleCurrentChange(newPage) {
            console.log(newPage)
            this.queryInfo.pagenum = newPage
            // 重新获取数据
            this.getUserList()
        },
        // 监听switch开关状态的改变
        async userStateChanged(userinfo) {
            console.log(userinfo)
            // :开头是参数
            // 为了拼接一些参数，尽量将''修改成模版字符串``
            // 通过Ajax发起put请求修改用户状态，返回promise对象，为简化操作，添加await、async
            const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
            if (res.meta.status !== 200) {
                // 因为更新失败需要将状态取反保证其未发生变化
                userinfo.mg_state = !userinfo.mg_state
                return this.$message.error('更新用户状态失败！')
            }
            this.$message.success('更新用户状态成功！')
        },
        // 监听添加用户对话框的关闭事件
        addDialogClosed() {
            // 关闭表单后重置表单
            this.$refs.addFormRef.resetFields()
        },
        // 点击按钮，添加新用户
        addUser() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return
                // post函数会返回一个promise，简化promise操作用哪个await、async
                // 预校验成功，发起真正的添加用户的网络请求
                const { data: res } = await this.$http.post('users', this.addForm)
                if (res.meta.status !== 201) {
                    this.$message.error('添加用户失败！')
                }
                this.$message.success('添加用户成功！')
                // 隐藏添加用户的对话框
                this.addDialogVisible = false
                // 重新获取用户列表数据
                this.getUserList()
            })
        },
        // 展示用户编辑的对话框
        async showEditDialog(id) {
            // console.log(id)
            const { data: res } = await this.$http.get('users/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error('查询用户信息失败！')
            }
            this.editForm = res.data
            this.editDialogVisible = true
        },
        // 监听修改用户对话框的关闭事件
        editDialogClosed() {
            this.$refs.editFormRef.resetFields()
        },
        // 修改用户信息并提交
        editUserInfo() {
            this.$refs.editFormRef.validate(async valid => {
                console.log(valid)
                // 预验证未通过直接return
                if (!valid) return
                // 预校验通过才发起修改用户信息的数据请求
                // put请求返回promise，魏建华promise操作使用await、async
                // 从await返回的对象中通过解构赋值解构出data属性重命名为res
                const { data: res } = await this.$http.put('users/' + this.editForm.id, {
                    email: this.editForm.email,
                    mobile: this.editForm.mobile
                })

                // 判断这次请求是否成功
                if (res.meta.status !== 200) {
                    return this.$message.error('更新用户信息失败！')
                }
                // 点 确定 后修改成功，关闭对话框
                this.editDialogVisible = false
                // 刷新用户列表
                this.getUserList()
                // 提示修改成功
                this.$message.success('更新用户信息成功！')
            })
        },
        // 根据id删除对应的用户信息
        async removeUserById(id) {
            // 弹框询问用户是否删除数据
            // 提示消息 弹框标题 配置对象(两个按钮+提示小图标)
            const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
                // 通过.catch捕获用户的取消行为
            ).catch(err => err)

            // 如果用户确认删除，则返回值为字符串"confirm"
            // 如果用户取消了删除，则返回值为字符串"cancel"
            // console.log(confirmResult)
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }

            const { data: res } = await this.$http.delete('users/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error('删除用户失败！')
            }
            // 提示用户删除成功信息
            this.$message.success('删除用户成功！')
            // 更新用户列表
            this.getUserList()
        },
        // 展示分配角色的对话框
        async setRole(userInfo) {
            this.userInfo = userInfo
            // 在展示对话框之前，获取所有角色的列表
            const { data: res } = await this.$http.get('roles')
            if (res.meta.status !== 200) {
                return this.$message.error('获取角色列表失败！')
            }
            this.rolesList = res.data
            this.setRoleDialogVisible = true
        },
        // 点击按钮，分配角色
        async saveRoleInfo() {
            // 如果!this.selectedRoleId===true时，证明用户没有选择新角色
            if (!this.selectedRoleId) {
                return this.$message.error('请选择要分配的角色！')
            }
            const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
            if (res.meta.status !== 200) {
                return this.$message.error('更新角色失败！')
            }
            this.$message.success('更新角色成功！')
            // 更新用户信息列表
            this.getUserList()
            // 关闭对话框
            this.setRoleDialogVisible = false
        },
        // 监听分配角色对话框的关闭事件
        setRoleDialogClosed() {
            // 将选中的角色id和当前用户信息进行重置
            this.selectedRoleId = ''
            this.userinfo = {}
        }
    }
}
</script>

<style lang="less" scoped></style>
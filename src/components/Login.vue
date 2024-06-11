<!-- 结构 -->
<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 头像区域 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 登录表单区域 ref引用-->
            <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <!-- 文本输入框 -->
                    <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <!-- 文本输入框 type="password"设置密码隐藏-->
                    <el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima"
                        type="password"></el-input>
                </el-form-item>
                <!-- 按钮区域 -->
                <el-form-item class="btns">
                    <!-- 蓝色按钮：登录 -->
                    <el-button type="primary" @click="login">登录</el-button>
                    <!-- 灰色按钮：重置 -->
                    <el-button type="info" @click="resetLoginForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<!-- 行为 -->
<script>
export default {
    data() {
        return {
            // 这是登录表单的数据绑定对象
            loginForm: {
                username: 'admin',
                password: '123456'
            },
            // 这是表单的验证规则对象
            loginFormRules: {
                // 验证用户名是否合法
                username: [
                    // required是否必填，trigger触发时机，文本框失去焦点时触发这次验证行为
                    { required: true, message: '请输入登录名称', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                // 验证密码是否合法
                password: [
                    { required: true, message: '请输入登录密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        // 点击重置按钮，重置登录表单
        resetLoginForm() {
            // 这里的this指向当前登录组件的实例对象
            // console.log(this);
            this.$refs.loginFormRef.resetFields();
        },
        login() {
            // 箭头函数只有一个参数时可省略小括号
            this.$refs.loginFormRef.validate(async valid => {
                // console.log(valid);
                if (!valid) return;  // false
                // 请求服务器需要保证api服务器处于运行中的状态，启动mysql数据库
                // 如果某个方法的返回值是promise，可用async，await来简化这次promise操作
                // await只能用在被async修饰的方法中
                // 解构出data属性重命名为res
                const { data: res } = await this.$http.post('login', this.loginForm);
                if (res.meta.status !== 200) return this.$message.error('登录失败！');
                this.$message.success("登录成功");
                // 1．将登录成功之后服务器分配的token，保存到客户端的sessionStorage中
                // 1.1 项目中除了登录之外的其他API接口，必须在登录之后才能访问（token相当于通行证）
                // 1.2 token只应在当前网站打开期间生效，所以将token保存在 sessionStorage中（localStorage是持久化的存储机制，sessionStorage是会话期间的存储机制）
                console.log(res);
                window.sessionStorage.setItem("token", res.data.token);
                //2．通过编程式导航跳转到后台主页，路由地址是/home
                this.$router.push('/home');

            })
        }
    }
}
</script>

<!-- 样式 -->
<!-- 支持less语法格式 -->
<!-- scoped只在当前节点下生效，去除则全局生效 -->
<style lang="less" scoped>
.login_container {
    background-color: #2b4b6b;
    height: 100%;
}

.login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    /* 圆角边框 */
    border-radius: 3px;
    /* 居中 */
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avatar_box {
        height: 130px;
        width: 130px;
        // 加一个边框线
        border: 1px solid #eee;
        // 圆角边框
        border-radius: 50%;
        // 让边框与图片间有一个间距
        padding: 10px;
        // 加阴影 x 偏移量 | y 偏移量 | 阴影模糊半径 | 阴影颜色 
        box-shadow: 0 0 10px #ddd;
        // 让图像水平居中
        position: absolute;
        left: 50%;
        // 盒子向左移自身的50%，向上移自身的50%
        transform: translate(-50%, -50%);
        background-color: #fff;

        img {
            width: 100%;
            height: 100%;
            // 图片也加圆角边框
            border-radius: 50%;
            background-color: #eee;
        }
    }
}

// 把form放到底部
.login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}

.btns {
    display: flex;
    // 从主轴尾部开始排列
    justify-content: flex-end;
}
</style>

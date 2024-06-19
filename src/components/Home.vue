<template>
    <!-- element-ui提供的组件名称就是它的类名 -->
    <el-container class="home-container">
        <!-- 头部区域 -->
        <el-header>
            <div>
                <img src="../assets/heima.png" alt="">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <!-- 页面主体区 -->
        <el-container>
            <!-- 侧边栏 -->
            <!-- 如果isCollapse是true,折叠则宽度是64px,展开宽度是200px -->
            <el-aside :width="isCollapse ? '64px' : '200px'">
                <!-- toggle-button实现折叠与展开的按钮 -->
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <!-- 侧边栏菜单区域 -->
                <!-- active-text-color表示激活的文本的颜色 -->
                <!-- :unique-opened="true"每次只允许一个子菜单展开，前面加：表示数据绑定，不加:，true只是个字符串(应该是bool值) 或者直接写 unique-opened表示希望把这个值设置为true-->
                <!-- collapse是否折叠收起菜单 -->
                <!-- collapse-transition是否开启折叠动画 -->
                <!-- router 重置为true(完整写法 :router="true")代表为整个侧边栏开启路由模式 激活导航时跳转到index的路径即subItem.id-->
                <!-- 每一个路由地址必须以/开头 -->
                <el-menu background-color="#333744" text-color="#fff" active-text-color="#409efe" unique-opened
                    :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
                    <!-- 一级菜单 -->
                    <!-- 首先用v-for循环渲染一级菜单，每个v-for都提供一个唯一的key(如果有id尽量用id) -->
                    <!-- 把index绑定动态字符串，index只接收字符串不接收数值，id是数值，要想将其转换为字符串，直接在后面拼接一个空字符串 -->
                    <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
                        <!-- 一级菜单的模板区 -->
                        <template slot="title">
                            <!-- 图标 -->
                            <i :class="iconsObj[item.id]"></i>
                            <!-- 文本 -->
                            <span>{{ item.authName }}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <!-- 循环渲染二级菜单，加：实现动态数据绑定，不加则为静态数据绑定 -->
                        <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id"
                            @click="saveNavState('/' + subItem.path)">
                            <!-- 图标 -->
                            <i class="el-icon-menu"></i>
                            <!-- 文本 -->
                            <span>{{ subItem.authName }}</span>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 右侧内容主体 -->
            <el-main>
                <!-- 路由占位符 -->
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    // 将获取到的数据立即挂载到data中
    data() {
        return {
            // 左侧菜单数据，menulist中的每一个都是一级菜单
            menulist: [],
            iconsObj: {
                '125': 'iconfont icon-users',
                '103': 'iconfont icon-tijikongjian',
                '101': 'iconfont icon-shangpin',
                '102': 'iconfont icon-danju',
                '145': 'iconfont icon-baobiao'
            },
            // 是否折叠（默认不折叠）
            isCollapse: false,
            // 定义数组保存被激活链接地址
            activePath: ''
        }
    },
    // 一种生命周期函数：示例创建完毕自动调用
    created() {
        this.getMenuList()
        this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods: {
        logout() {
            window.sessionStorage.clear();
            this.$router.push('/login');
        },
        // 获取所有的菜单
        async getMenuList() {
            // .get函数返回值是一个promise，添加await可简化操作
            // 解构赋值，把data结构出来重命名为res
            const { data: res } = await this.$http.get('menus')
            // 先判断是否成功获取，获取数据失败返回错误消息
            if (res.meta.status != 200) return this.$message.error(res.meta.msg)
            // 获取成功赋值
            this.menulist = res.data
            console.log(res)
        },
        // 点击按钮，切换菜单的折叠与展开
        toggleCollapse() {
            this.isCollapse = !this.isCollapse
        },
        // 保存链接的激活状态
        saveNavState(activePath) {
            window.sessionStorage.setItem('activePath', activePath)
            this.activePath = activePath
        }
    }
}
</script>

<style lang="less" scoped>
.home-container {
    height: 100%;
}

.el-header {
    background-color: #373d41;
    display: flex;
    // 左右贴边对齐，剩余平分
    justify-content: space-between;
    // 清空左padding
    padding-left: 0;
    // 侧轴方向上居中
    align-items: center;
    color: #fff;
    font-size: 20px;

    // 嵌套  >子元素选择器
    >div {
        display: flex;
        align-items: center;
    }
}

.el-aside {
    background-color: #333744;

    .el-menu {
        border-right: none;
    }
}

.el-main {
    background-color: #EAEDF1;
}

// 让字体图标和导航栏之间增加边距
.iconfont {
    margin-right: 10px;
}

.toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    // 行高
    line-height: 24px;
    color: #fff;
    text-align: center;
    // 字符间距
    letter-spacing: 0.2em;
    // 鼠标经过时变成小狗
    cursor: pointer;
}
</style>
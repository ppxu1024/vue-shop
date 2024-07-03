<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 提示区域 -->
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
            </el-alert>
            <!-- 步骤条区域 -->
            <!-- align-center 标题和描述居中显示 -->
            <!-- active 控制激活项（只接受数值类型），故此处将字符串activeIndex - 0 变为数值 -->
            <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <!-- tab栏区域 -->
            <!-- label-position="top"指定标签label在上 -->
            <!-- before-leave绑定的事件，只要触发它证明将要发生标签页的切换 -->
            <!-- tab-click tab 被选中时触发 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
                <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave"
                    @tab-click="tabClicked">
                    <!-- 点击不同的tab-pane面板会绑定到v-model中，要想步骤条和tab栏保持一致，只要tab中v-model与steps中active绑定的变量保持一致即可 -->
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <!-- 级联选择器 -->
                            <!-- options数据源 -->
                            <!-- v-model双向绑定的数组 -->
                            <!-- props用来指定配置对象 -->
                            <!-- @change="handleChange"选择项发生变化触发这个函数 -->
                            <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateProps"
                                @change="handleChange">
                            </el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <!-- 渲染表单的item项 -->
                        <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                            <!-- 复选框 -->
                            <el-checkbox-group v-model="item.attr_vals">
                                <!-- border 使每一项复选框带边框 -->
                                <!-- :label="cb" 使显示的标签项动态绑定cb -->
                                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i"
                                    border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                            <!-- 文本输入框里为每一项的属性 -->
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <!-- 上传图片 -->
                        <!-- action 表示图片要上传到的后台API地址（这里不应该写相对路径，应该写完整地址）因为后台接口地址8888与用户显示地址8080不同 -->
                        <!-- on-preview 指定预览的事件(点击图片名称时触发的事件) -->
                        <!-- on-remove 单击叉号时触发的事件 -->
                        <!-- list-type 指定当前预览组件的呈现方式 -->
                        <!-- :headers="headerObj"上传每一张图片时都手动为它指定一个请求头 -->
                        <!-- :on-success="handleSuccess"图片上传成功触发事件 -->
                        <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove"
                            list-type="picture" :headers="headerObj" :on-success="handleSuccess">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <!-- 富文本编辑器组件 -->
                        <quill-editor v-model="addForm.goods_introduce">
                        </quill-editor>
                        <!-- 添加商品的按钮 -->
                        <!-- @click="add"为了验证商品描述已经添加上 -->
                        <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>

        <!-- 图片预览 -->
        <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
            <img :src="previewPath" alt="" class="previewImg">
        </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'

export default {
    // 私有数据节点，return一个对象
    data() {
        return {
            // steps和tab的激活项
            activeIndex: '0',
            // 添加商品的表单数据对象
            addForm: {
                goods_name: '',
                goods_price: 0,
                goods_weight: 0,
                goods_number: 0,
                // 商品所属的分类数组
                goods_cat: [],
                // 图片的数组
                pics: [],
                // 商品的详情描述
                goods_introduce: '',
                attrs: []
            },
            // 表单验证规则
            addFormRules: {
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
                ],
                goods_cat: [
                    { required: true, message: '请选择商品分类', trigger: 'blur' },
                ]
            },
            // 商品分类列表
            cateList: [],
            // 指定级联选择器的配置对象
            cateProps: {
                // expandTrigger: 'hover'通过鼠标覆盖来展开子菜单
                expandTrigger: 'hover',
                // 看到的选项
                label: 'cat_name',
                // 实际选中项
                value: 'cat_id',
                // 指定哪个属性实现父子嵌套
                children: 'children'
            },
            // 动态参数列表
            manyTableData: [],
            // 静态属性列表
            onlyTableData: [],
            // 上传图片的URL地址
            uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
            // 图片上传组件的headers请求头对象
            headerObj: {
                Authorization: window.sessionStorage.getItem('token')
            },
            // 预览路径
            previewPath: '',
            // 控制预览图片对话框的显示与隐藏
            previewVisible: false
        }
    },
    // 生命周期函数
    created() {
        this.getCateList()
    },
    // 所有事件处理函数
    methods: {
        // 获取所有商品分类数据
        async getCateList() {
            const { data: res } = await this.$http.get('categories')
            if (res.meta.status !== 200) {
                return this.$message.error('获取商品分类数据失败！')
            }
            this.cateList = res.data
            console.log(this.cateList)
        },
        // 级联选择器选中项变化，会触发这个函数
        handleChange() {
            console.log(this.addForm.goods_cat)
            // 没有选中三级分类，直接清空
            if (this.addForm.goods_cat.length !== 3) {
                this.addForm.goods_cat = []
            }
        },
        // 由于直接写activeName会报错定义未使用，故此处改为占位符_
        beforeTabLeave(_, oldActiveName) {
            // console.log('即将离开的标签页名字是：' + oldActiveName)
            // console.log('即将进入的标签页名字是：' + activeName)
            // 只要返回false就会阻止标签页切换
            // return false
            if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
                this.$message.error('请先选择商品分类！')
                return false
            }
        },
        // tab被选中时触发的函数
        async tabClicked() {
            // console.log(this.activeIndex)
            // 证明访问的是动态参数面板
            // this.cateId 计算属性
            if (this.activeIndex === '1') {
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
                    {
                        params:
                            { sel: 'many' }
                    }
                )
                if (res.meta.status !== 200) {
                    return this.$message.error('获取动态参数列表失败！')
                }
                console.log(res.data)
                res.data.forEach(item => {
                    // 判断item.attr_vals是否为空，空直接返回空数组，非空根据空格进行划分
                    // 这样处理避免空数组的情况返回空字符串
                    item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
                });
                this.manyTableData = res.data
            } else if (this.activeIndex === '2') {
                // 证明访问的是静态属性面板
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
                    {
                        params:
                            { sel: 'only' }
                    }
                )
                if (res.meta.status !== 200) {
                    return this.$message.error('获取静态属性列表失败！')
                }
                console.log(res.data)
                this.onlyTableData = res.data
            }
        },
        // 处理图片预览效果，file为接收到的将要预览的图片信息
        handlePreview(file) {
            console.log(file)
            // 从图片信息中得到图片的完整路径
            this.previewPath = file.response.data.url
            this.previewVisible = true
        },
        // 处理移除图片的操作
        handleRemove(file) {
            console.log(file)
            // 1.获取将要删除的图片的临时路径
            const filePath = file.response.data.tmp_path
            // 2.从pics数组中，找到这个图片对应的索引值
            const i = this.addForm.pics.findIndex(x => {
                x.pic == filePath
            })
            // 3.调用数组的splice方法，把图片信息对象，从pics数组中移除
            this.addForm.pics.splice(i, 1)
            console.log(this.addForm)
        },
        // 监听图片上传成功的事件
        handleSuccess(response) {
            console.log(response)
            // 1. 拼接得到一个图片信息对象
            const picInfo = { pic: response.data.tmp_path }
            // 2. 将图片信息对象，push到pics数组中
            this.addForm.pics.push(picInfo)
            console.log(this.addForm)
        },
        // 添加商品
        add() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) {
                    return this.$message.error('请填写必要的表单项！')
                }
                // 执行添加的业务逻辑
                // 对goods_cat进行数据处理
                // 后端API文档要求goods_cat为字符串，故要将数组元素用逗号拼接成一个字符串 
                // 由于级联选择器中的v-model需要数组，而这里需要字符串，会出现冲突，故这里进行深拷贝处理
                // lodash cloneDeep(obj)深拷贝 
                const form = _.cloneDeep(this.addForm)
                form.goods_cat = form.goods_cat.join(',')
                // 对attrs进行数据处理，包含动态参数和静态属性
                // 处理动态参数
                this.manyTableData.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals.join('')
                    }
                    this.addForm.attrs.push(newInfo)
                })
                // 处理静态属性
                this.onlyTableData.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        // 静态属性本来就是字符串
                        attr_value: item.attr_vals
                    }
                    this.addForm.attrs.push(newInfo)
                })
                form.attrs = this.addForm.attrs
                console.log(form)

                // 发起请求添加商品
                // 商品的名称必须是唯一的
                const { data: res } = await this.$http.post('goods', form)
                if (res.meta.status !== 201) {
                    return this.$message.error('添加商品失败！')
                }
                this.$message.success('添加商品成功！')
                // 通过编程式导航跳转到商品列表页面
                this.$router.push('/goods')
            })
            console.log(this.addForm)
        }
    },
    // 计算属性
    computed: {
        cateId() {
            // 三级分类才返回id
            if (this.addForm.goods_cat.length === 3) {
                return this.addForm.goods_cat[2]
            }
            return null
        }
    }
}
</script>

<style lang="less" scoped>
.el-checkbox {
    // 确保margin设置不会被其他规则轻易覆盖
    // margin 上右下左
    margin: 0 10px 0 0 !important;
}

.previewImg {
    // 宽度撑满整个对话框窗口
    width: 100%;
}

.btnAdd {
    // 按钮靠右
    // float: right;
    // 增加上边距
    margin-top: 15px;
}
</style>
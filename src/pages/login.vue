<template>
    <el-container style="width:100%;max-width:500px;margin:0 auto">
        <el-header>
            <span style="font-size: 30px">登录</span>
        </el-header>
        <el-main>
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm">
                <el-form-item v-if="err">
                    <el-alert type="error">
                        {{err}}
                    </el-alert>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="ruleForm.email" placeholder="邮箱"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="ruleForm.password" placeholder="密码" show-password></el-input>
                </el-form-item>
                <el-form-item v-if="reg" label="昵称" prop="name">
                    <el-input v-model="ruleForm.name" placeholder="昵称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="login0('ruleForm')">登录</el-button>
                    <el-button @click="register0('ruleForm')">注册</el-button>
                </el-form-item>
            </el-form>
        </el-main>
    </el-container>
</template>

<script>
    export default {
        name: "LoginPage",
        components: {
            //
        },
        data() {
            return {
                err: null,
                qaq: null,
                reg: false,
                ruleForm: {
                    name: null,
                    email: null,
                    password: null
                },
                rules: {
                    name: [{required: true, message: '请输入昵称', trigger: 'blur'}],
                    password: [{required: true, message: '请输入密码', trigger: 'blur'}],
                    email: [
                        {required: true, message: '请输入邮箱', trigger: 'blur'},
                        {type: 'email', message: '请输入有效的邮箱', trigger: 'blur'}
                    ]
                }
            }
        },
        mounted() {
            //
        },
        methods: {
            login0(formName) {
                if (this.reg) {
                    this.reg = false;
                    return;
                }
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.axios.post('/api/auth/login', {
                            'email': this.ruleForm.email,
                            'password': this.ruleForm.password
                        }).then((response) => {
                            console.log("SUCCESS")
                            localStorage.token = response.data.token
                            window.location.href = './'
                        }).catch((error) => {
                            console.log(error)
                            this.err = '用户名或密码错误'
                        })
                    }
                });
            },
            register0(formName) {
                if (!this.reg) {
                    this.reg = true;
                    return;
                }
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.axios.post('/api/auth/reg', {
                            'name': this.ruleForm.name,
                            'email': this.ruleForm.email,
                            'password': this.ruleForm.password
                        }).then((response) => {
                            console.log("SUCCESS")
                            localStorage.token = response.data.token
                            window.location.href = './'
                        }).catch((error) => {
                            console.log(error)
                            this.err = '内部错误'
                        })
                    }
                });
            }
        }
    }
</script>

<style scoped>

</style>
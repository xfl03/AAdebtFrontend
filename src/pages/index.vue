<template>
    <el-container style="width:100%;max-width:500px;margin:0 auto">
        <el-header>
            <span style="font-size: 30px">账目组</span>
        </el-header>
        <el-main>
            <el-card shadow="hover">
                <el-form :model="ruleForm" :rules="rules" ref="ruleForm">
                    <el-form-item v-if="err">
                        <el-alert type="error">
                            {{err}}
                        </el-alert>
                    </el-form-item>
                    <el-form-item v-if="info">
                        <el-alert type="success">
                            {{info}}
                        </el-alert>
                    </el-form-item>
                    <el-form-item label="账目组名称" prop="name">
                        <el-input v-model="ruleForm.name" placeholder="名称"></el-input>
                    </el-form-item>
                    <el-form-item :key="index" v-for="(item,index) in ruleForm.parts" :label="'参与者'+(index+1)"
                                  :prop="'parts.'+index+'.name'" :rules="newRules.parts">
                        <el-input v-model="item.name" placeholder="参与者名称"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="addParts()">增加参与者</el-button>
                        <el-button @click="removeParts()">减少参与者</el-button>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="newGroup('ruleForm')">新建账目组</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
            <el-row :key="group.groupId" v-for="group in qaq">
                <el-card shadow="hover">
                    <div style="padding: 14px;">
                        <span>{{group.name}}</span>
                        <div class="bottom clearfix">
                            <span class="locked" v-if="group.locked" style="color:#67C23A">已销账</span>
                            <span class="locked" v-if="!group.locked" style="color:#F56C6C">未销账</span>
                            <a :href="'./group.html?'+group.groupId" class="button">查看账目详情</a>
                        </div>
                    </div>
                </el-card>
            </el-row>
        </el-main>
    </el-container>
</template>

<script>

    export default {
        name: 'App',
        components: {
            //
        },
        data() {
            return {
                err: null,
                info: null,
                qaq: [],
                ruleForm: {
                    name: null,
                    parts: [{name: ""}, {name: ""}]
                },
                rules: {
                    name: [{required: true, message: '请输入名称', trigger: 'blur'}]
                },
                newRules: {
                    parts: [{required: true, message: '请输入参与者', trigger: 'blur'}]
                }
            }
        },
        mounted() {
            this.refresh()
        },
        methods: {
            refresh() {
                this.axios.get("/api/aa/list").then((response) => {
                    this.qaq = response.data.groups
                })
            },
            newGroup(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        let parts = []
                        this.ruleForm.parts.forEach((v) => {
                            parts.push(v.name)
                        })
                        this.axios.post('/api/aa/new', {
                            'name': this.ruleForm.name,
                            'parts': parts
                        }).then((response) => {
                            console.log(response)
                            this.refresh()
                            this.err = null
                            this.info = '已添加'
                        }).catch((error) => {
                            console.log(error)
                            this.err = '内部错误'
                            this.info = null
                        })
                    }
                });
            },
            addParts() {
                this.err = null
                this.ruleForm.parts.push({name: null})
            },
            removeParts() {
                if (this.ruleForm.parts.length <= 2) {
                    this.err = '至少需要两位参与者'
                    this.info = null
                    return
                }
                this.ruleForm.parts.splice(this.ruleForm.parts.length - 1, 1)
            }
        }
    }
</script>

<style>
    .locked {
        font-size: 13px;
        color: #999;
    }

    .bottom {
        margin-top: 13px;
        line-height: 12px;
    }

    .button {
        padding: 0;
        float: right;
        color: #409EFF;
        text-decoration: blink;
    }
</style>

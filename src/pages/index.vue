<template>
    <el-container style="width:100%;max-width:500px;margin:0 auto">
        <el-header>
            <el-breadcrumb style="margin-top:10px;font-size:30px" separator-class="el-icon-arrow-right">
                <el-breadcrumb-item>账目组</el-breadcrumb-item>
            </el-breadcrumb>
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
                    <el-form-item label="账目组类型">
                        <el-switch
                                style="width:100%"
                                v-model="filterAA"
                                active-text="AA记账"
                                inactive-text="普通记账">
                        </el-switch>
                    </el-form-item>

                    <div v-if="filterAA">
                        <el-form-item label="参与者" style="margin-bottom: 0px"></el-form-item>
                        <el-form-item :key="index" v-for="(item,index) in ruleForm.parts"
                                      :prop="'parts.'+index+'.name'" :rules="newRules.parts">
                            <el-input v-model="item.name" placeholder="参与者名称"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button @click="addParts()">增加参与者</el-button>
                            <el-button @click="removeParts()">减少参与者</el-button>
                        </el-form-item>
                    </div>

                    <el-form-item>
                        <el-button type="primary" @click="newGroup('ruleForm')">新建账目组</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
            <el-card shadow="hover">
                <el-form>
                    <el-form-item label="筛选器">
                        <el-switch
                                @change="filterLockedChange"
                                style="width:100%"
                                v-model="filterLocked"
                                active-text="仅未销账"
                                inactive-text="显示全部">
                        </el-switch>
                    </el-form-item>
                </el-form>
            </el-card>
            <el-row :key="group.groupId" v-for="group in qaq">
                <el-card shadow="hover">
                    <div style="padding: 14px;">
                        <span>{{group.name}}</span>
                        <div class="bottom clearfix">
                            <span class="locked" v-if="group.type === 0 && group.locked"
                                  style="color:#67C23A">已销账</span>
                            <span class="locked" v-if="group.type === 0 && !group.locked"
                                  style="color:#F56C6C">未销账</span>
                            <span class="locked" v-if="group.type === 1" style="color:#409EFF">普通记账</span>
                            <a v-if="group.type === 0" :href="'./group.html?'+group.groupId" class="button">查看账目详情</a>
                            <a v-if="group.type === 1" :href="'./normal.html?'+group.groupId" class="button">查看账目详情</a>
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
                filterAA: false,
                filterLocked: false,
                err: null,
                info: null,
                qaq: [],
                qwq: [],
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
            this.filterLocked = localStorage.filterLocked === "true"
            this.refresh()
        },
        methods: {
            refresh() {
                this.axios.get("/api/aa/list").then((response) => {
                    this.qwq = response.data.groups
                    this.filterLockedChange()
                })
            },
            newGroup(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        if (this.filterAA) {
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
                        } else {
                            this.axios.post('/api/debt/new', {
                                'name': this.ruleForm.name
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
            },
            filterLockedChange() {
                localStorage.filterLocked = this.filterLocked
                this.qaq = []
                this.qwq.forEach(e => {
                    if (!this.filterLocked || !e.locked) {
                        this.qaq.push(e)
                    }
                })
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

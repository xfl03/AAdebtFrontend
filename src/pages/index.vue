<template>
    <el-container class="page">
        <el-header>
            <el-breadcrumb style="margin-top:10px;font-size:30px;float:left" separator-class="el-icon-arrow-right">
                <el-breadcrumb-item>账目组</el-breadcrumb-item>
            </el-breadcrumb>
            <user></user>
        </el-header>
        <el-container style="flex-wrap:wrap">
            <el-main class="main" style="padding-bottom: 0">
                <el-card shadow="hover">
                    <el-form :model="ruleForm" :rules="rules" ref="ruleForm">
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
            </el-main>
            <el-main class="main" style="padding-top: 0">
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
                        <div style="padding: 14px;" class="card">
                            <span class="top-left">{{group.name}}</span>
                            <div class="bottom">
                                <span class="bottom-left green" v-if="group.type === 0 && group.locked">已销账</span>
                                <span class="bottom-left red" v-if="group.type === 0 && !group.locked">未销账</span>
                                <span class="bottom-left blue" v-if="group.type === 1">普通记账</span>
                                <a :href="'./'+(group.type === 0?'group':'normal')+'.html?'+group.groupId"
                                   class="bottom-right blue">查看账目详情</a>
                            </div>
                        </div>
                    </el-card>
                </el-row>
            </el-main>
        </el-container>
        <el-backtop></el-backtop>
    </el-container>
</template>

<script>
    import user from '../components/user'
    export default {
        name: 'App',
        components: {
            user
        },
        data() {
            return {
                filterAA: false,
                filterLocked: false,
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
                                this.$message({
                                    showClose: true,
                                    type: 'success',
                                    message: '已添加'
                                })
                            }).catch((error) => {
                                console.log(error)
                                this.$message({
                                    showClose: true,
                                    type: 'error',
                                    message: '内部错误'
                                })
                            })
                        } else {
                            this.axios.post('/api/debt/new', {
                                'name': this.ruleForm.name
                            }).then((response) => {
                                console.log(response)
                                this.refresh()
                                this.$message({
                                    showClose: true,
                                    type: 'success',
                                    message: '已添加'
                                })
                            }).catch((error) => {
                                console.log(error)
                                this.$message({
                                    showClose: true,
                                    type: 'error',
                                    message: '内部错误'
                                })
                            })
                        }
                    }
                });
            },
            addParts() {
                this.ruleForm.parts.push({name: null})
            },
            removeParts() {
                if (this.ruleForm.parts.length <= 2) {
                    this.$message({
                        showClose: true,
                        type: 'error',
                        message: '至少需要两位参与者'
                    })
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

<style lang="stylus">
    @import "../assets/main.styl"
    @import "../assets/color.styl"
</style>

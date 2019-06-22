<template>
    <el-container class="page">
        <el-header>
            <el-breadcrumb style="margin-top:10px;font-size:30px" separator-class="el-icon-arrow-right">
                <el-breadcrumb-item><a href="./">账目组</a></el-breadcrumb-item>
                <el-breadcrumb-item>{{name}}</el-breadcrumb-item>
            </el-breadcrumb>
        </el-header>
        <el-container style="flex-wrap:wrap">
            <el-main class="main" style="padding-bottom: 0">
                <el-card shadow="hover">
                    <el-form :model="ruleForm" :rules="rules" ref="ruleForm">
                        <el-form-item label="账目名称" prop="name">
                            <el-input v-model="ruleForm.name" placeholder="名称"></el-input>
                        </el-form-item>
                        <el-form-item label="付款者" prop="payer">
                            <el-select style="width:100%" v-model="ruleForm.payer" placeholder="请选择付款者">
                                <el-option v-for="it in qwq" :key="it.partId" :label="it.name"
                                           :value="it.partId"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="参与者" style="margin-bottom: 0"></el-form-item>
                        <el-row :key="index" v-for="(item,index) in ruleForm.parts">
                            <el-col :span="12">
                                <el-form-item class="grid-content"
                                              :prop="'parts.'+index+'.partId'" :rules="newRules.parts">
                                    <el-select v-model="item.partId" placeholder="请选择参与者">
                                        <el-option v-for="it in qwq" :key="it.partId" :label="it.name"
                                                   :value="it.partId"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item class="grid-content" :prop="'parts.'+index+'.amount'"
                                              :rules="newRules.amount">
                                    <el-input v-model="item.amount" placeholder="金额（元）"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-form-item>
                            <el-button @click="addParts()">增加参与者</el-button>
                            <el-button @click="removeParts()">减少参与者</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="newDebt('ruleForm')">新建账目</el-button>
                        </el-form-item>
                    </el-form>
                </el-card>
                <el-card shadow="hover">
                    <el-form>
                        <el-form-item>
                            <el-button @click="cal()">清算</el-button>
                            <el-button @click="lock0()">销账</el-button>
                        </el-form-item>
                        <el-form-item v-if="details" label="账目明细">
                            <el-table :data="details" stripe style="width:100%">
                                <el-table-column prop="name" label="参与者"></el-table-column>
                                <el-table-column prop="paid" label="总付款"></el-table-column>
                                <el-table-column prop="total" label="总消费"></el-table-column>
                            </el-table>
                        </el-form-item>

                        <el-form-item v-if="pays" label="最优清账方案">
                            <el-table :data="pays" stripe style="width:100%">
                                <el-table-column prop="f" label="支付者"></el-table-column>
                                <el-table-column prop="t" label="收款者"></el-table-column>
                                <el-table-column prop="amount" label="金额"></el-table-column>
                            </el-table>
                        </el-form-item>
                    </el-form>
                </el-card>
            </el-main>
            <el-main class="main" style="padding-top: 0">
                <el-row :key="debt.debtId" v-for="debt in qaq">
                    <el-card shadow="hover">
                        <div style="padding: 14px;" class="card">
                            <span class="top-left">{{debt.name}}</span>
                            <div class="bottom">
                                <span class="bottom-left green">付款者： {{debt.payer.name}}</span>
                                <span class="bottom-right blue">总金额： {{debt.amount/100.0}}</span>
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
    export default {
        name: "group",
        data() {
            return {
                groupId: 0,
                qaq: [],
                qwq: [],
                details: null,
                pays: null,
                rules: {
                    name: [{required: true, message: '请输入名称', trigger: 'blur'}],
                    payer: [{required: true, message: '请选择付款者', trigger: 'blur'}]
                },
                newRules: {
                    parts: [{required: true, message: '请选择参与者', trigger: 'blur'}],
                    amount: [
                        {required: true, message: '请输入金额', trigger: 'blur'},
                        {validator: this.valNum, message: '请输入有效的金额', trigger: 'blur'}
                    ]
                },
                ruleForm: {
                    name: null,
                    payer: null,
                    parts: [{partId: null, amount: null}]
                },
                name: '账目详情'
            }
        },
        mounted() {
            this.groupId = window.location.search.substr(1)
            this.refresh()
        },
        methods: {
            valNum(rule, value, callback) {
                if (!/^[0-9.]+$/.test(value))
                    return callback(new Error("Not a number"))
                return callback()
            },
            lock0() {
                this.axios.post("/api/aa/lock", {groupId: this.groupId, locked: true}).then((response) => {
                    console.log(response)
                    this.$message({
                        showClose: true,
                        type: 'success',
                        message: '已销账'
                    })
                })
            },
            refresh() {
                this.axios.post("/api/aa/debt", {groupId: this.groupId}).then((response) => {
                    if (response.data.code < 0) {
                        this.$message({
                            showClose: true,
                            type: 'error',
                            message: '无访问权限'
                        })
                        return
                    }
                    this.qaq = response.data.debts
                    if (response.data.name) this.name = response.data.name
                    document.title = this.name + ' - AA记账'
                })
                this.axios.post("/api/aa/part", {groupId: this.groupId}).then((response) => {
                    if (response.data.code < 0) {
                        this.$message({
                            showClose: true,
                            type: 'error',
                            message: '无访问权限'
                        })
                        return
                    }
                    this.qwq = response.data.parts
                })
            },
            addParts() {
                this.ruleForm.parts.push({partId: null, amount: null})
            },
            removeParts() {
                if (this.ruleForm.parts.length <= 1) {
                    this.$message({
                        showClose: true,
                        type: 'error',
                        message: '至少需要一位参与者'
                    });
                    return;
                }
                this.ruleForm.parts.splice(this.ruleForm.parts.length - 1, 1)
            },
            newDebt(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        let parts = [];
                        this.ruleForm.parts.forEach(e => parts.push({
                            partId: e.partId,
                            amount: Math.round(Number(e.amount) * 100)
                        }))
                        this.axios.post('/api/aa/add', {
                            'groupId': this.groupId,
                            'name': this.ruleForm.name,
                            'payerId': this.ruleForm.payer,
                            'details': parts
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
                });
            },
            cal() {
                this.axios.post("/api/aa/cal", {groupId: this.groupId}).then((response) => {
                    this.details = []
                    response.data.detail.forEach((e) => {
                        this.details.push({name: e.name, paid: e.paid / 100, total: e.total / 100})
                    })
                    this.pays = []
                    response.data.pay.forEach((e) => {
                        this.pays.push({f: e.from.name, t: e.to.name, amount: e.amount / 100})
                    })
                })
            }
        }

    }
</script>

<style lang="stylus">
    @import "../assets/main.styl"
    @import "../assets/color.styl"
</style>
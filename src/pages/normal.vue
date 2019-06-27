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
                        <el-form-item label="账目类别" prop="type">
                            <el-select @change="onchange" style="width:100%" v-model="ruleForm.type"
                                       placeholder="请选择类别">
                                <el-option v-for="(it,index) in qwq" :key="index" :label="it"
                                           :value="index"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="账目金额" prop="amount">
                            <el-input v-model="ruleForm.amount" placeholder="金额"></el-input>
                        </el-form-item>
                        <el-form-item label="账目日期" prop="date">
                            <el-date-picker v-model="ruleForm.date" style="width:100%" type="date"
                                            placeholder="日期"></el-date-picker>
                        </el-form-item>
                        <el-form-item>
                            <el-button v-if="editing===0" type="primary" @click="newDebt('ruleForm')">新建账目</el-button>
                            <el-button v-else type="primary" @click="editDebt('ruleForm')">修改账目</el-button>
                            <el-button @click="clr()">重置</el-button>
                        </el-form-item>
                    </el-form>
                </el-card>
                <el-card shadow="hover">
                    <el-form>
                        <el-form-item>
                            <el-button @click="cal()">清算</el-button>
                        </el-form-item>
                        <el-form-item v-if="details"
                                      :label="'总消费：'+details.total+' / 日均消费：'+details.average"></el-form-item>
                        <el-form-item v-if="details" label="日消费">
                            <el-table :data="details.dates" stripe style="width:100%">
                                <el-table-column prop="date" label="日期"></el-table-column>
                                <el-table-column prop="amount" label="总消费"></el-table-column>
                            </el-table>
                        </el-form-item>

                        <el-form-item v-if="details" label="分类消费">
                            <el-table :data="details.types" stripe style="width:100%">
                                <el-table-column prop="typename" label="类型"></el-table-column>
                                <el-table-column prop="amount" label="总消费"></el-table-column>
                            </el-table>
                        </el-form-item>
                    </el-form>
                </el-card>
            </el-main>
            <el-main class="main" style="padding-top: 0">
                <el-card>
                    <el-form>
                        <el-form-item label="筛选器">
                            <el-switch
                                    style="width:100%"
                                    v-model="filterMod"
                                    active-text="编辑模式">
                            </el-switch>
                        </el-form-item>
                    </el-form>
                </el-card>
                <el-row :key="debt.debtId" v-for="debt in qaq">
                    <el-card shadow="hover">
                        <div style="padding: 14px;" class="card">
                            <span class="top-left">{{debt.name}}</span>
                            <div v-if="filterMod" class="top-right">
                                <span class="green" @click='edit(debt)'>编辑 </span>
                                <span class="orange" @click='copy(debt)'>复制 </span>
                                <span class="red" @click='del(debt.debtId)'>删除</span>
                            </div>
                            <div class="bottom">
                                <span class="bottom-left green">{{debt.date}} {{qwq[debt.type]}}</span>
                                <span class="bottom-right blue">金额： {{debt.amount/100.0}}</span>
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
                editing: 0,
                groupId: 0,
                qaq: [],
                qwq: [
                    "其它", "正餐", "零食", "生活", "交通",
                    "教育", "电器", "游戏", "娱乐", "通讯",
                    "服饰", "礼物", "捐赠"
                ],
                details: null,
                pays: null,
                rules: {
                    name: [{required: true, message: '请输入名称', trigger: 'blur'}],
                    type: [{required: true, message: '请选择类别', trigger: 'blur'}],
                    amount: [
                        {required: true, message: '请输入金额', trigger: 'blur'},
                        {validator: this.valNum, message: '请输入有效的金额', trigger: 'blur'}
                    ],
                    date: [{required: true, message: '请选择日期', trigger: 'blur'}]
                },
                ruleForm: {
                    name: null,
                    amount: null,
                    type: null,
                    date: new Date()
                },
                filterMod: false,
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
            refresh() {
                this.axios.post("/api/debt/debt", {groupId: this.groupId}).then((response) => {
                    if (response.data.code < 0) {
                        this.$message({
                            showClose: true,
                            type: 'error',
                            message: '无访问权限'
                        });
                        return
                    }
                    this.qaq = response.data.debts
                    if (response.data.name) this.name = response.data.name
                    document.title = this.name + ' - AA记账'
                })
            },
            newDebt(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        let amount = Math.round(Number(this.ruleForm.amount) * 100)
                        this.axios.post('/api/debt/add', {
                            'groupId': this.groupId,
                            'name': this.ruleForm.name,
                            'type': this.ruleForm.type,
                            'amount': amount,
                            'date': this.$moment(this.ruleForm.date).format("YYYY-MM-DD")
                        }).then((response) => {
                            console.log(response)
                            this.refresh()
                            this.$message({
                                showClose: true,
                                type: 'success',
                                message: '已添加'
                            })
                            this.clr()
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
            editDebt(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        let amount = Math.round(Number(this.ruleForm.amount) * 100)
                        this.axios.post('/api/debt/edit', {
                            'debtId': this.editing,
                            'groupId': this.groupId,
                            'name': this.ruleForm.name,
                            'type': this.ruleForm.type,
                            'amount': amount,
                            'date': this.$moment(this.ruleForm.date).format("YYYY-MM-DD")
                        }).then((response) => {
                            console.log(response)
                            this.refresh()
                            this.$message({
                                showClose: true,
                                type: 'success',
                                message: '已修改'
                            })
                            this.clr()
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
            clr() {
                this.editing = 0
                this.ruleForm.name = null
                this.ruleForm.type = null
                this.ruleForm.amount = null
                this.ruleForm.date = new Date()
            },
            cal() {
                this.axios.post("/api/debt/cal", {groupId: this.groupId}).then((response) => {
                    this.details = response.data
                    this.details.types.forEach(it => {
                        it.typename = this.qwq[it.type]
                        it.amount /= 100
                    })
                    this.details.dates.forEach(it => {
                        it.amount /= 100
                    })
                    this.details.total /= 100
                    this.details.average /= 100
                })
            },
            onchange() {
                if (this.ruleForm.name != null) return
                this.ruleForm.name = this.qwq[this.ruleForm.type]
            },
            del(debtId) {
                this.$confirm('确认删除账目？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.axios.post("/api/debt/del", {groupId: this.groupId, debtId: debtId}).then(() => {
                        this.$message({
                            showClose: true,
                            type: 'success',
                            message: '已删除'
                        })
                        this.refresh()
                    })
                });
            },
            copy(debtInfo) {
                this.ruleForm.name = debtInfo.name
                this.ruleForm.type = debtInfo.type
                this.ruleForm.amount = debtInfo.amount / 100.0
                this.ruleForm.date = new Date(debtInfo.date)
                this.editing = 0
                window.scrollTo(0, 0)
            },
            edit(debtInfo) {
                this.copy(debtInfo)
                this.editing = debtInfo.debtId
            }
        }

    }
</script>

<style lang="stylus">
    @import "../assets/main.styl"
    @import "../assets/color.styl"
</style>
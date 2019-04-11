<template>
    <el-container style="width:100%;max-width:500px;margin:0 auto">
        <el-header>
            <el-breadcrumb style="margin-top:10px;font-size:30px" separator-class="el-icon-arrow-right">
                <el-breadcrumb-item><a href="./">账目组</a></el-breadcrumb-item>
                <el-breadcrumb-item>账目详情</el-breadcrumb-item>
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
                    <el-form-item label="账目名称" prop="name">
                        <el-input v-model="ruleForm.name" placeholder="名称"></el-input>
                    </el-form-item>
                    <el-form-item label="账目类别" prop="type">
                        <el-select @change="onchange" style="width:100%" v-model="ruleForm.type" placeholder="请选择类别">
                            <el-option v-for="(it,index) in qwq" :key="index" :label="it"
                                       :value="index"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="账目金额" prop="amount">
                        <el-input v-model="ruleForm.amount" placeholder="金额"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="newDebt('ruleForm')">新建账目</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
            <el-card shadow="hover">
                <el-form>
                    <el-form-item>
                        <el-alert v-if="info2" type="success">
                            {{info2}}
                        </el-alert>
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
                    <el-form-item>
                        <el-button @click="cal()">清算</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
            <el-row :key="debt.debtId" v-for="debt in qaq">
                <el-card shadow="hover">
                    <div style="padding: 14px;">
                        <span style="font-size:20px">{{debt.name}}</span>
                        <div class="bottom clearfix">
                            <span class="locked" style="color:#67C23A">{{debt.date}} {{qwq[debt.type]}}</span>
                            <span class="button">金额： {{debt.amount/100.0}}</span>
                        </div>
                    </div>
                </el-card>
            </el-row>
        </el-main>
    </el-container>
</template>

<script>
    export default {
        name: "group",
        data() {
            return {
                err: null,
                info: null,
                info2: null,
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
                    ]
                },
                ruleForm: {
                    name: null,
                    amount: null,
                    type: null
                }
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
                        this.err = '无访问权限'
                        return
                    }
                    this.qaq = response.data.debts
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
                            'amount': amount
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
            }
        }

    }
</script>

<style scoped>

    .locked {
        font-size: 15px;
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
<template>
    <el-dropdown style="float: right;font-size: 20px;margin-top:15px" @command="logout">
        <span style="cursor: pointer">
            {{name}}<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="0">注销</el-dropdown-item>
        </el-dropdown-menu>
    </el-dropdown>
</template>

<script>
    export default {
        name: "user",
        data() {
            return {
                name: null
            }
        },
        mounted() {
            this.axios.get("/api/user/info").then((response) => {
                this.name = response.data.name
            })
        },
        methods: {
            logout(command) {
                this.axios.get("/api/user/logout").then((response) => {
                    console.log(command+response)
                    window.location.href = './login.html'
                })
            }
        }
    }
</script>

<style scoped>

</style>
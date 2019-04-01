module.exports = {
    pages: {
        index: {
            entry: 'src/pages/index.js',
            template: 'public/index.html',
            title: 'index',
            filename: 'index.html'
        },
        login: {
            entry: 'src/pages/login.js',
            template: 'public/index.html',
            title: 'login',
            filename: 'login.html'
        },
        group: {
            entry: 'src/pages/group.js',
            template: 'public/index.html',
            title: 'group',
            filename: 'group.html'
        },
        normal: {
            entry: 'src/pages/normal.js',
            template: 'public/index.html',
            title: 'group',
            filename: 'normal.html'
        }
    },
    devServer: {
        proxy: 'http://localhost:8080'
    }
}
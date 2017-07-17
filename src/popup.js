'use strict';
import "babel-polyfill";
import Vue from 'vue';
window.Vue = Vue;
var bg_window = null;
var $vm = window.$vm = new Vue({
    el:'#app',
    data:{
       page:'',
       contacts:[],
       groups:[],
       filterName:'' 
    },
    methods:{
        showContacts(){
            this.page = 'contacts';
            this.updateConcats()
        },
        updateConcats(){
            let bot = bg_window.getBot();
            let contacts = [];
            for(let key in bot.contacts){
                contacts.push(bot.contacts[key]);
            }
            this.contacts = contacts.filter(contact=>contact.NickName);
            this.groups = contacts.filter(contact=>contact.UserName.indexOf('@@')!=-1)
        },
        login(){
            let bot = bg_window.newBot();
            bot.on('user-avatar', avatar => {
                $('.login_box .avatar img').attr('src',avatar)
                this.page = 'confirm';
            });
            bot.on('login', () => {
                console.log('登录成功')
                this.showContacts();
            });
            bot.on('logout', () => {
                console.log('注销成功')
            });
            bot.on('error', err => {
                console.log(err);
            });
            bot.on('contacts-updated',contacts=>{
                console.log('更新用户列表：',contacts)
                this.updateConcats()
            });
            bot.on('uuid',uuid=>{
                console.log('拿到uuid')
                $('.qrcode-img .img')
                .attr({'src':`https://login.weixin.qq.com/qrcode/${uuid}`})
            })
            bot.start();  
        },
        initList() {

        }
    },
    created(){
        bg_window = chrome.extension.getBackgroundPage();
        let bot = bg_window.getBot();
        
        if (bot.state == bg_window.getWxState().login) {
            this.showContacts();
        } else {
            this.page = 'scan';
            this.login();
        }
    },
    page(val) {
        console.log(val);
        if (val == 'contacts') {
          setTimeout(() => {
            this.initList();
          }, 0)
        }
    },
    filerName(val) {
        console.log(val);
        this.initList();
    }
});







function logout() {
    let bot = bg_window.getBot();
    bot.logout()
        .then(() => {
            login();
        })
        .catch(err => {
        $vm.page.error = 'error';
        console.log(err);
        setTimeout(() => {
            login();
        }, 2000);
        });
}


      
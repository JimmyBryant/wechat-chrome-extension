'use strict';
import "babel-polyfill";
import Vue from 'vue';
window.Vue = Vue;
let bg_window = null;
let bot = null;
var $vm = window.$vm = new Vue({
    el:'#app',
    data:{
       page:'',
       contacts:[],
       groups:[],
       quanCount:0,
       filterName:'' 
    },
    methods:{
        clickHandler(e){
            let elem = e.target;
            alert('点我了')
            if(elem.id){
                switch(elem.id){
                    case "capture-quan":
                        if(!bot.captrueQuan){
                            console.log('开始采集优惠券')
                            bot._startCaptureQuan();
                            elem.innerText = '停止采集优惠券'; 
                        }else{
                            bot.captrueQuan = false;
                            elem.innerText = '开始采集优惠券';                             
                        }
                    break;
                    case "auto-send":
                        if(!bot.autoSend){
                            console.log('开始群发优惠券')
                            bot._startAutoSend();
                            elem.innerText = '停止群发优惠券'; 
                        }else{
                            bot.captrueQuan = false;
                            elem.innerText = '开始群发优惠券';                             
                        } 
                    break;
                }
            }else{
                console.log('点击事件',elem)
                updateCheckedGroup($(elem));   
            }    
        },
        showContacts(){
            this.page = 'contacts';
            this.groups = bot.groups;
        },
        login(){
            bot = bg_window.newBot();
            bot.on('user-avatar', avatar => {
                $('.login_box .avatar img').attr('src',avatar)
                this.page = 'confirm';
            });
            bot.on('login', () => {
                console.log('登录成功')
                // 保存数据，方便快速登录
                localStorage.reloginProp = JSON.stringify(bot.botData)
                this.showContacts();
                this.quanCount = bot.quanCount;
            });
            bot.on('logout', () => {
                // 清楚登录信息
                delete localStorage.reloginProp;
                console.log('注销成功')
            });
            bot.on('error', err => {
                console.log(err);
            });
            bot.on('contacts-updated',contacts=>{
                bot._updateContact();  
                // this.contacts = bot.ava_contacts;
                this.groups = bot.groups;
            });
            bot.on('uuid',uuid=>{
                console.log('拿到uuid')
                $('.qrcode-img .img')
                .attr({'src':`https://login.weixin.qq.com/qrcode/${uuid}`})
            });

            // bot.start();  

            if (bot.PROP.uin) {
              // 存在登录数据时，可以随时调用restart进行重启
              bot.restart()
            } else {
              bot.start()
            }
            
        },
        initList() {

        }
    },
    created(){
        bg_window = chrome.extension.getBackgroundPage();
        bot = bg_window.getBot();
        
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




/* 
@elem {Object} Dom element
*/
function updateCheckedGroup(elem){
    let name = encodeURI(elem.value)
        ,checked = elem.checked
        ,groups = {}
        ,bot = bg_window.getBot()
        ;
    if(localStorage.checkedGroup){
        groups = JSON.parse(localStorage.checkedGroup);
    }
    if(checked){
        groups[name] = true;
    }else{
        delete groups[name];
    }
    bot.groups.forEach(contact=>{
        if(contact.NickName==elem.value){
            if(checked){
                contact.Checked = true;
            }else{
                delete contact.Checked;
            }
            
        }
    });
    localStorage.checkedGroup = JSON.stringify(groups);
}

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


      
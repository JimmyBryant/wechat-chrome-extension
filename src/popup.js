'use strict';
import "babel-polyfill";
import Vue from 'vue';
window.Vue = Vue;
let bg_window = null;
let bot = null;
var $vm = window.$vm = new Vue({
    el: '#app',
    data: {
        page: '',
        contacts: [],
        groups: [],
        quan_count: 0,
        auto_captrue_state:false,
        auto_send_state:false,
        filterName: '',
        max_quan_page:localStorage.max_quan_page||2,    //默认采集前6页数据
        auto_send_time_span:localStorage.auto_send_time_span||20 //自动发送优惠券间隔,单位秒
    },
    methods: {
        keyupHandler(e){
            let elem = e.target;
            if(elem.id){
                switch(elem.id){
                    case "auto-send-time-span":
                        if(!isNaN(parseInt(elem.value))){
                            this.auto_send_time_span = localStorage.auto_send_time_span = parseInt(elem.value);
                        }
                    break;
                    case "max-quan-page":
                        if(!isNaN(parseInt(elem.value))){
                            this.max_quan_page = localStorage.max_quan_page = parseInt(elem.value);
                        }
                    break;
                }
            }
        },
        clickHandler(e) {
            let elem = e.target;
            if (elem.id) {
                switch (elem.id) {
                    case "capture-quan":
                        if (!bot.auto_captrue_quan) {
                            console.log('开始采集优惠券')
                            bot._startCaptureQuan(this.max_quan_page)
                            .then(p=>{
                            elem.innerText = '开始采集优惠券';
                            var notification = new Notification('优惠券抓取成功', {
                                body: "已经成功抓取了前"+p+"页的优惠券数据"
                            });

                            }).catch(err=>{
                                console.error(err);
                            });
                            elem.innerText = '停止采集优惠券';
                        } else {
                            bot.auto_captrue_quan = false;
                            elem.innerText = '开始采集优惠券';
                        }
                    break;
                    case "auto-send":
                        if (!bot.auto_send) {
                            console.log('开始群发优惠券')
                            bot._startAutoSend(this.auto_send_time_span);
                            elem.innerText = '停止群发优惠券';
                        } else {
                            elem.innerText = '开始群发优惠券';
                            bot._stopAutoSend();
                            
                        }
                    break;
                    case "btn-logout":
                        if(confirm('确定要注销登录？')){
                            logout();
                        }
                    break;
                }
            } else {
                updateCheckedGroup(elem);
            }
        },
        showContacts() {
            this.page = 'contacts';
            this.groups = bot.groups;
        },
        login() {
            // 使用新的bot实例，避免旧bot实例绑定过多事件
            bot = bg_window.newBot();
            bot.on('user-avatar', avatar => {
                $('.login_box .avatar img').attr('src', avatar)
                this.page = 'confirm';
            });
            bot.on('login', () => {
                console.log('登录成功')
                // 保存数据，方便快速登录
                localStorage.reloginProp = JSON.stringify(bot.botData)
                this.showContacts();
                this.quan_count = bot.quan_count;
            });
            bot.on('logout', () => {
                // 清除登录信息
                delete localStorage.reloginProp;
                this.login();
                console.log('注销成功');
            });
            bot.on('error', err => {
                console.log(err);
            });
            bot.on('contacts-updated', contacts => {
                bot._updateContact();
                // this.contacts = bot.ava_contacts;
                this.groups = bot.groups;
            });
            bot.on('uuid', uuid => {
                console.log('拿到uuid')
                $('.qrcode-img .img')
                    .attr({ 'src': `https://login.weixin.qq.com/qrcode/${uuid}` })
            });

            if (bot.PROP.uin) {
                // 存在登录数据时，可以随时调用restart进行重启
                bot.restart()
            } else {
                bot.start()
            }

        }
    },
    created() {
        bg_window = chrome.extension.getBackgroundPage();
        bot = bg_window.getBot();

        if (bot.state == bg_window.getWxState().login) {
            this.showContacts();
            this.quan_count = bot.quan_count;
            this.auto_send_state = bot.auto_send;
            this.auto_captrue_state = bot.auto_captrue_quan;
        } else {
            this.page = 'scan';
            this.login();
        }
    }
});




/* 
@elem {Object} Dom element
*/
function updateCheckedGroup(elem) {
    let name = encodeURI(elem.value),
        checked = elem.checked,
        groups = {},
        bot = bg_window.getBot();
    if (localStorage.checkedGroup) {
        groups = JSON.parse(localStorage.checkedGroup);
    }
    if (checked) {
        groups[name] = true;
    } else {
        delete groups[name];
    }

    // 更新bot.groups Checked属性
    for(let i in bot.groups){
        let contact = bot.groups[i];
        if (contact.NickName == elem.value) {
            if (checked) {
                contact.Checked = true;
            } else {
                delete contact.Checked;
            }
            break;
        }        
    }

    localStorage.checkedGroup = JSON.stringify(groups);
}

function logout() {
    console.log('注销');
    bot.stop();
    $vm.page = 'scan';
    $vm.login();
}
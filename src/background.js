'use strict';
import "babel-polyfill";
import Wechat from 'wechat4u';

class WxBot extends Wechat {

  constructor() {
    super();
    this.on('login',()=>{
        this.on('message',msg=>{
        /**
         * 获取消息时间
         */
        console.log(`----------${msg.getDisplayTime()}----------`)
        /**
         * 获取消息发送者的显示名
         */
        console.log(this.contacts[msg.FromUserName].getDisplayName()+'发来消息:')
        /**
         * 判断消息类型
         */
        switch (msg.MsgType) {
            case this.CONF.MSGTYPE_TEXT:
            /**
             * 文本消息
             */
            console.log(msg.Content)
            this._botReply(msg)

        }});
        // this.on('contacts-updated',contacts=>{
        //     console.log('更新contacts',JSON.stringify(contacts))
        //     console.log('联系人数量：', Object.keys(this.contacts).length)
        //     this.contacts = this.contacts;
        // });
        this.on('user-avatar', avatar => {
            console.log('登录用户头像Data URL：', avatar)
        })
    });

  }

  _tuning(word) {
    let params = {
      'key': 'a2e961f3496f4f6eace7d6c95fb3e393',
      'info': word
    };
    return this.request({
      method: 'GET',
      url: 'http://www.tuling123.com/openapi/api',
      params: params
    }).then(res => {
      const data = res.data;
      if (data.code == 100000) {
        return data.text + '[图灵机器人]';
      }
      throw new Error('tuning返回值code错误', data);
    }).catch(err => {
      console.log(err);
      return '现在思路很乱，最好联系下我哥 T_T...';
    });
  }

  _botReply(msg) {
    if(msg['Content']){
        this._tuning(msg['Content']).then((reply) => {
            this.sendMsg(reply, msg['FromUserName']);
            console.log(reply);
        });
    };  
  }
}

let bot = null;
window.getBot = () => {
  if (!bot)
    bot = new WxBot();
  return bot;
};
window.newBot = () => {
  bot = null;
  return window.getBot();
};
window.getWxState = () => {
  return Wechat.STATE;
};

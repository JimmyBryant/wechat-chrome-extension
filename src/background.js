'use strict';
import "babel-polyfill";
import Wechat from 'wechat4u';

class WxBot extends Wechat {

  constructor(data) {
    super(data);
    this.groups = [];
    this.ava_contacts = [];
    // 
    var auto_msg_timer = null;
    var localStorage = window.localStorage;

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
            // this._botReply(msg)

        }});
        this.on('contacts-updated',contacts=>{
          this._updateContact()
/*           clearTimeout(auto_msg_timer);
          auto_msg_timer = setTimeout(()=>{this._autoSendMsg()},5000) */
        });
        this.on('user-avatar', avatar => {
            console.log('登录用户头像Data URL：', avatar)
        })
    });
  }

  /*
  * 更新微信群
  */
  _updateContact(){
    let contacts_list = [];
    for(let key in this.contacts){
      contacts_list.push(this.contacts[key]);
    }
    this.ava_contacts = contacts_list.filter(contact=>contact.NickName&&contact.UserName.indexOf('@@')===-1);
    this.groups = contacts_list.filter(contact=>contact.NickName&&contact.UserName.indexOf('@@')!=-1);
    this.updateGroups();
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

  _requestQuan(){
    let page = localStorage.page||1;
    let params = {
      'r': 'Port/index',
      'type': 'total',
      'v':2,
      'page':page,
      'appkey':'8ven3b83so'
    };
    return this.request({
      method: 'GET',
      url: 'http://api.dataoke.com/index.php',
      params: params      
    }).then(res=>{
      const data = res.data;
      let result = data.result;
      localStorage.quan_total = localStorage.quan_total.slice(0,-1)+','+JSON.stringify(result).substring(1);
      localStorage.page = +page+1;
      return  result;
    }).catch(err=>{
      console.log(err);
      return '大淘客api请求出错';
    });
  }

  _loadImg(url){
    return new Promise((resolve,reject)=>{
      var xhr = new XMLHttpRequest();
      xhr.open('get',url,true);
      xhr.responseType = "blob";
      xhr.onload = function(){
        if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            let blob = xhr.response;
            resolve({data:blob})
        }else{
          let err = "加载图片出错"
          reject(err)
        }
      };
      xhr.send();
    });
  }

  _autoSendMsg(data){
    data = {"D_title": "\u5de7\u7684\u6728\u9676\u74f7\u6c34\u676f\u6709\u76d6\u9a6c\u514b\u676f", "Title": "\u5de7\u7684\u6728\u9676\u74f7\u6c34\u676f\u6709\u76d6\u9a6c\u514b\u676f\u725b\u5976\u65e9\u9910\u676f\u9676\u74f7\u676f\u521b\u610f\u6d6e\u96d5\u5496\u5561\u676f\u5e26\u76d6\u676f", "Dsr": 4.8, "Commission_queqiao": 0.00, "Quan_receive": 0, "Quan_price": 20.00, "Quan_time": "2017-07-24 23:59:59", "Jihua_link": "http://pub.alimama.com/myunion.htm?spm=2013.1.0.0.45Gd0g#!/promo/self/campaign?campaignId=24243670&shopkeeperId=56977931&userNumberId=2056390438", "Price": 19.90, "Jihua_shenhe": 0, "Introduce": "\u5de7\u7684\u6728\u9676\u74f7\u6c34\u676f\uff0c\u6709\u76d6\u9a6c\u514b\u676f\uff0c\u725b\u5976\u65e9\u9910\u676f\uff0c\u521b\u610f\u6d6e\u96d5\u5496\u5561\u676f\uff0c\u8d85\u503c\u62a2\u8d2d\u3002", "Cid": 4, "Sales_num": 152, "Quan_link": "http://shop.m.taobao.com/shop/coupon.htm?seller_id=2056390438&activity_id=19d8f71a1a574f8891def8e2a1618f5d", "IsTmall": 1, "GoodsID": "539953819470", "Commission_jihua": 30.50, "ID": 3032209, "Que_siteid": "0", "Commission": 30.50, "Pic": "https://img.alicdn.com/imgextra/i4/2842220742/TB29E.0XQ7myKJjSZFIXXc0OVXa_!!2842220742.jpg", "Org_Price": 39.90, "Quan_m_link": "", "Quan_id": "19d8f71a1a574f8891def8e2a1618f5d", "Quan_condition": "39", "Quan_surplus": 1000, "SellerID": "2056390438"};
    let pic = data.Pic;
    let filename = pic.substring(pic.lastIndexOf('/')+1);
    let _ = this;
    
    this._loadImg(pic).then(res=>{
      let blob = res.data;
      console.log(typeof res.data,res.data instanceof File,res.data instanceof Blob)

      let obj = {
        file: new File([blob], filename, {type: blob.type, lastModified: new Date().valueOf()}),
        filename:filename
      }
      this.groups.forEach(contact=>{
        this.sendMsg(obj, contact.UserName)
        .catch(err => {
          this.emit('error', err)
        })
        this.sendMsg(data.D_title,contact.UserName)
      });
    }).catch(err=>{throw err});

    
  }
  /* 
  * 更新微信群属性：是否选择群发
  */
  updateGroups(){
    if(localStorage.checkedGroup){
      let checkedGroup = JSON.parse(localStorage.checkedGroup);
      let arr = Object.keys(checkedGroup);
      this.groups.forEach(group=>{
        let key = encodeURI(group.NickName);
        if(arr.includes(key)){
          group.Checked = true;
        }
      })
    }
  }
}

let bot = null;
window.getBot = () => {
  let prop = null;
  if (!bot){
    if(localStorage.reloginProp){
      prop = JSON.parse(localStorage.reloginProp) 
    }
    bot = new WxBot(prop);    
  }   
  return bot;
};
window.newBot = () => {
  bot = null;
  return window.getBot();
};
window.getWxState = () => {
  return Wechat.STATE;
};

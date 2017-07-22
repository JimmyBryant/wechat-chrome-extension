'use strict';
import "babel-polyfill";
import Wechat from 'wechat4u';
let idb = require('./idb');

class WxBot extends Wechat {
 
  constructor(data) {
    super(data);
    this.captrueQuan = false; // 是否开始采集优惠券
    this.autoSend = false;  //是否开始自动群发
    this.groups = [];
    this.ava_contacts = [];
    this.quanCount = 0; //采集优惠券的数量
    this.sendedIndex = 1; // 发送优惠券起始index
    // 初始化indexedDB
    idb.initDb()
    .then(db=>{
      console.debug("initDb DONE,start to get quan count");
      // 获取优惠券数量
      idb.getCount(idb.STORE_NAME.TOTAL).then(count=>{
        console.log('获取到优惠券数量')
        return this.quanCount = count;
      },reason=>{
        throw reason;
      })
    }).catch(er=>{
      throw err;
    });

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
        });

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
      let data = res.data;
      localStorage.page = ++page;
      return  data.result;
    }).catch(err=>{
      console.log(err);
      throw '大淘客api请求出错';
    });
  }

  /* 
  * @method
  * @param {Array<Objet>} data  优惠券信息，JSON数组
  * @return Promise
  */
  _storeQuan(data){
    return idb.addItems(idb.STORE_NAME.TOTAL,data).then(()=>{
       return idb.getCount(idb.STORE_NAME.TOTAL).then(count=>{
        return this.quanCount = count;
       })
    });
  }

  /* 
    开始采集优惠券
  */
  _startCaptureQuan(){
    let _this = this;
    this.captrueQuan = true;
    function loop(){
      _this._requestQuan().then(data=>{
          return _this._storeQuan(data)
        },reason=>{
          throw reason;
        }).then(()=>{
        if(_this.captrueQuan){
          loop();
        }
      },reason=>{
        throw reason;
      })
    }
    loop();
  }
  _sendQuanMsg(data){
    let pic = data.Pic;
    let filename = pic.substring(pic.lastIndexOf('/')+1);
    let _ = this;
    
    return this.request({method:'get',url:pic,responseType:'blob'}).then(res=>{
      let blob = res.data;
      let obj = {
        file: new File([blob], filename, {type: blob.type, lastModified: new Date().valueOf()}),
        filename:filename
      }
      this.groups.forEach(contact=>{
        // 判断是否勾选群发
        if(contact.Checked){
          this.sendMsg(obj, contact.UserName).then(()=>{
            return this.sendMsg(data.D_title,contact.UserName);
          }).catch(err => {
            this.emit('error', err)
          })
          
        }
      });
    }).catch(err=>{throw err});

    
  }
  /* 
    @method 自动群发优惠券
  */
  _startAutoSend(){
    var _this = this;
    _this.autoSend = true; 
    let t = setInterval(function(){
      let l = _this.sendedIndex
          ,count = 1
          ,u = l+1
          ;
      idb.getRangeCursor(idb.STORE_NAME.TOTAL,l,u).then(cursor=>{
        if(cursor){
          let data = cursor.value;
          _this._sendQuanMsg(data).then(()=>{
            _this.sendedIndex = u;  // 重新设置sendIndex
          });
          cursor.continue();
        }
      })
    },1000*10)
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

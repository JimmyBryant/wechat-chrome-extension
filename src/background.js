'use strict';
import "babel-polyfill";
import Wechat from 'wechat4u';
let alimama  = require('./util/alimama');
let idb = require('./util/idb');
let CONF = require('./util/conf');
let taoQuan = require('./util/quan');

class WxBot extends Wechat {
 
  constructor(data) {
    super(data);
    this.auto_captrue_quan = false; // 是否开始自动采集优惠券
    this.auto_send = false;  //是否开始自动群发
    this.groups = [];
    this.ava_contacts = [];
    this.quan_count = 0; //采集优惠券的数量
    this.initDB();  //初始化数据库
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
    初始化数据库
    @method
  */
  initDB(){
    const DB_NAME = "wxbot-chrome-extension";
    const DB_VERSION = this.getDBVersion();
    // 初始化indexedDB
    idb.initDb(DB_NAME,DB_VERSION)
    .then(db=>{
      // 获取优惠券数量
      idb.getCount(CONF.STORE_NAME.TOTAL).then(count=>{
        console.debug('获取到优惠券数量:',count)
        return this.quan_count = count;
      },reason=>{
        throw reason;
      })
    }).catch(err=>{
      throw err;
    });
  }
  /* 
    获取数据库版本号
    @method
    @return {integer} 数据库版本号
  */
  getDBVersion(){
    let date_str = new Date().toLocaleDateString();
    if(localStorage.captrue_date!=date_str){
      let old_version = +(localStorage.db_version||1);
      let new_version = old_version+1;
      localStorage.captrue_date = date_str;
      localStorage.db_version = new_version; // 存储db version
      localStorage.quan_page = 0;  //表示目前采集0页
      localStorage.sended_quan_count = 0; //表示已经发送优惠券数量
      return new_version;
    }else{
      return localStorage.db_version;
    }
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

  /* 
    @method 开始采集优惠券
  */
  _startCaptureQuan(max_page=2){
    let _this = this;
    this.auto_captrue_quan = true;
    return new Promise((resolve,reject)=>{
      function loop(){
        if(localStorage.quan_page>=max_page){
          _this._stopCaptureQuan();
          resolve(max_page);
          return false;
        }
        let p = Promise.resolve();
        // 表示还没开始采集
        if(localStorage.quan_page==0){
          p = taoQuan.requestTop100().then(data=>{  // 先采集top100商品
            taoQuan.storeQuan(CONF.STORE_NAME.TOTAL,data)
          },reason=>{
            throw reason;
          });
        }
        p.then(()=>{
          // 再采集全站商品
          return taoQuan.requestTotal()
        },reason=>{
          throw reason
        }).then(data=>{
          taoQuan.storeQuan(CONF.STORE_NAME.TOTAL,data)
        },reason=>{
          throw reason;
        }).then(()=>{
          if(_this.auto_captrue_quan){
            loop();
          }
        })
      }
      loop();
    });
  }

  /* 
    暂停采集优惠券
    @method
  */
  _stopCaptureQuan(){
    this.auto_captrue_quan = false;
  }
  /* 
    @method 发送优惠券消息
  */
  _sendQuanMsg(data){
    let pic = data.Pic;
    let filename = pic.substring(pic.lastIndexOf('/')+1);
    let _ = this;
    // 只发有优惠券商品
    if(data.CouponLinkTaoToken){
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
              let msg_text = `${data.D_title} 【包邮秒杀】\n【在售价】${parseFloat(data.Org_Price).toFixed(2)}元\n【券后价】${parseFloat(data.Price).toFixed(2)}元\n【下单链接】${data.CouponShortLinkUrl}\n-----------\n复制这条信息${data.CouponLinkTaoToken}，打开☞手机淘宝☜即可购买！`;
              return this.sendMsg(msg_text,contact.UserName);
            }).catch(err => {
              this.emit('error', err)
            })
          }
        });
      }).catch(err=>{throw err}); 
    }
  }
  /* 
    @method 开启自动群发优惠券
  */
  _startAutoSend(time_span=20){
    
    var _this = this;
    _this.auto_send = true; 
 
    function send(){
      if(!_this.auto_send){
        return false;
      }
      let low = parseInt(localStorage.sended_quan_count)+1
          ,up = low+1
          ;
      return idb.getRangeCursor(CONF.STORE_NAME.TOTAL,low,up).then(cursor=>{
        if(cursor){
          let data = cursor.value;
          alimama.getToken(data.GoodsID).then(res=>{
            let d = res.data;
            if(d.couponLinkTaoToken){
              data.CouponLinkTaoToken = d.couponLinkTaoToken;
              data.CouponShortLinkUrl = d.couponShortLinkUrl;
              return data;
            }else{
              let err = {
                tip:'该商品没有优惠券'
              }
              throw err;
            }
          },reason=>{
            _this.emit('alimama-login');
            throw  reason;
          }).then(data=>{
            return _this._sendQuanMsg(data).then(()=>{
              console.debug('成功发送第',low,'个商品',new Date());
              localStorage.sended_quan_count = low;  // 设置已经发送优惠券数量
              setTimeout(function(){send()},time_span*1000);  //定时发送下一条
            });
          },reason=>{
            console.error(reason);
            localStorage.sended_quan_count = low;  // 设置已经发送优惠券数量
            console.debug('第',low,'个商品没有优惠券',new Date())
            send(); // 发送下一条
          });
          cursor.continue();
        }
      }) 
    }
    send();
  }

  /* 
    @method 暂停群发
  */
  _stopAutoSend(){
    this.auto_send = false; 
  }
  /*
  *  @method 更新微信群属性：是否群发
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
// 默认配置
if(!localStorage.max_quan_page){
  localStorage.max_quan_page = 2; // 默认采集2页数据
}
if(!localStorage.auto_send_time_span){
  localStorage.auto_send_time_span = 30;  //默认间隔30秒群发
}
if(!localStorage.sended_quan_count){  // 已经发送条数默认为0
  localStorage.sended_quan_count=0;
}

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

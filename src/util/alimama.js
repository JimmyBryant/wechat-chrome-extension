'use strict';
let  axios = require('axios'); 
let alimama = {
    /* 
        模拟阿里妈妈登录
        @method
    */
    login(){
        let psd = 'kuangkuang324796';
    },
    getAdZone(){
        let url = 'http://pub.alimama.com/common/adzone/newSelfAdzone2.json?tag=29&itemId=552220693426&blockId=&t=1500866067226&_tb_token_=qZfgrBNDmpq&pvid=10_222.188.153.160_576_1500862980397';
        let params = {

        }
    },
    /* 
        @param {Integer} id  商品id
        @return {Promise}
    */
    getToken(id){
        // 先获取cookie
        return new Promise((resolve,reject)=>{
            chrome.cookies.get({
                url:'http://pub.alimama.com',
                name:'_tb_token_'
            },function(cookie){
               resolve(cookie) 
            })
        }).then(cookie=>{
            if(!cookie){
                let err = {tip:'还未登录阿里妈妈'}
                throw err;
            }
            let url = 'http://pub.alimama.com/common/code/getAuctionCode.json';
            let params = {
                auctionid:id,
                adzoneid:'110582761',
                siteid:'29668844',
                scenes:1,
                t:Date.now(),
                _tb_token_:cookie.value

            };
            return axios.request({
                url:url,
                method:'get',
                params:params
            }).then(res=>{
                // 如果返回的是字符串，表示登录失效
                if(res.data.length>0){
                    let err = {tip:'还未登录阿里妈妈'}
                    throw err;
                }
                return res.data;
            }).catch(err=>{
                throw err;
            });
        })
    }
}

exports = module.exports = alimama;



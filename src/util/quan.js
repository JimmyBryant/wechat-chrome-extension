'use strict';
let CONF = require('./conf');
let idb = require('./idb');
let axios = require('axios');

let taoQuan = {
    requestTop100(){
        let params = {
        'r': 'Port/index',
        'type': 'top100',
        'v':2,
        'appkey':'8ven3b83so'
        };
        return axios.request({
            method: 'GET',
            url: 'http://api.dataoke.com/index.php',
            params: params      
        }).then(res=>{
            let data = res.data;
            return  data.result;
        }).catch(err=>{
            throw '大淘客api请求出错';
        });
    },
    requestTotal(){
        console.debug('采集所有优惠券')
        let page = localStorage.quan_page||1;
        let params = {
        'r': 'Port/index',
        'type': 'total',
        'v':2,
        'page':page,
        'appkey':'8ven3b83so'
        };
        return axios.request({
            method: 'GET',
            url: 'http://api.dataoke.com/index.php',
            params: params      
        }).then(res=>{
            let data = res.data;
            localStorage.quan_page = ++page;
            return  data.result;
        }).catch(err=>{
            throw err;
        });
    },
    requestPaoliang(){

    },
    /* 
    * @method
    * @param {String} name storeObject名称
    * @param {Array<Objet>} data  优惠券信息，JSON数组
    * @return Promise
    */
    storeQuan(name,data){
        return idb.addItems(name,data).then(()=>{
            return idb.getCount(name).then(count=>{
                return this.quan_count = count;
            })
        }).catch(err=>{
            throw err;
        });
    }
}

exports = module.exports = taoQuan;
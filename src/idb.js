'use strict';
var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
const DB_NAME = "wxbot-chrome-extension";
// const DB_NAME = "fffff";
const DB_VERSION = 1;
const DB_STORE_NAME = {
    TOTAL:'quan_total'
};
let db = null;
let idb = {
    STORE_NAME:DB_STORE_NAME,
    /* 
    *   创建存储空间
    */
    initDb() {
        return new Promise((resolve,reject)=>{
            var req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onsuccess = function (event) {
                db = event.target.result;
                resolve(db);
            };
            req.onerror = function (event) {
                console.error("initDb:", event.target.errorCode);
                reject(event.target.errorCode);
            };

            req.onupgradeneeded = function (event) {
                console.debug("initDb.onupgradeneeded");
                var db = event.target.result;
                var objectStore = db.createObjectStore(DB_STORE_NAME.TOTAL, {autoIncrement: true });
            };
        })
    },
    /* 
        @method
        @param {String} name objectStore名称
        @param {Array<Object>} dataList 要添加的数据队列，JSON数组
        @return Promise
    */
    addItems(name,dataList){
        return  Promise.resolve().then(()=>{
            let objectStore = db.transaction(name, 'readwrite') .objectStore(name);
            let promiseArr = [];
            for (let i in dataList) {
                let p = new Promise((resolve,reject)=>{
                    let data = dataList[i];
                    let request = objectStore.add(data);
                    request.onsuccess = function(event) {
                        resolve(data)
                    };
                    request.onerror = function(event) {
                        reject('添加数据失败')
                    };
                })
                promiseArr.push(p);
            }
            return Promise.all(promiseArr);
        }).catch(err=>{
            throw err;
        })
    },
    /* 
        获取objectStore数量
        @method 
        @param {String} name objectStore的名称
        @return Promise
    */
    getCount(name){
        return new Promise((resolve,reject)=>{
            let objectStore = db.transaction(name, 'readwrite') .objectStore(name);
            var countRequest = objectStore.count();
            countRequest.onsuccess = function() {
                resolve(countRequest.result);
            }
            countRequest.onerror = function (event) {
                console.error("initDb:", event.target.errorCode);
                reject(event.target.errorCode);
            };
        })
    },
    /* 
        @method 批量查询数据
        @param {String} name objectStore名称
        @param {Integer} l  起始key
        @param {Integer} u  最大值key
        @return IDBCursor
    */
    getRangeCursor(name,l=0,u){
        return new Promise((resolve,reject)=>{
            let objectStore = db.transaction([name], 'readwrite') .objectStore(name);
            let range = IDBKeyRange.bound(l,u);
            objectStore.openCursor(range).onsuccess = function(event){
                var cursor = event.target.result;
                resolve(cursor);
            }
        })
    }
}

exports = module.exports = idb;
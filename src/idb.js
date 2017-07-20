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
        console.debug("initDb ...");
        var req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onsuccess = function (event) {
            db = this.result;
            console.debug("initDb DONE");
        };
        req.onerror = function (event) {
            console.error("initDb:", event.target.errorCode);
        };

        req.onupgradeneeded = function (event) {
            console.debug("initDb.onupgradeneeded");
            var db = event.target.result;
            var objectStore = db.createObjectStore(DB_STORE_NAME.TOTAL, {autoIncrement: true });
        };

        
    },
    addItems(name,dataList){
        return  Promise.resolve().then(()=>{
            let tx = db.transaction(name, 'readwrite');
            let objectStore = tx.objectStore(name);
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
                return Promise.all(promiseArr);
            }
        }).catch(err=>{
            throw err;
        })
    }
}

exports = module.exports = idb;
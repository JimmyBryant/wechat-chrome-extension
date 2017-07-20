'use strict';
var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
const dbname = "wxbot-chrome-extension";
const version = 1;
export const idb = {
    open(){
        return new Promise((resolve,reject)=>{
            let request = indexedDB.open(dbname,version);
            request.onerror = function(){
                reject('打开indexedDB出错');
            }
            request.onsuccess = function(event) {
               resolve(event.target.result);
            }
        });
    },
    createObjectStore(){
        return Promise.resolve().then(idb.open().then(db=>{
            let store1 = 'quan_total';
            if (!db.objectStoreNames.contains(store1)) {
               return db.createObjectStore(store1,{autoIncrement : true});
            }else{
                throw 'objectStore已存在';
            }
        })).catch(err=>{
            throw err;
        });
    },
    addItem(name,data){
        return  Promise.resolve().then(idb.open().then(db=>{
            var tx = db.transaction(name, 'readwrite');
            var store = tx.objectStore(name);
            store.add(data);
            new Promise((resolve,reject)=>{
                tx.oncomplete = function(event) {
                    resolve(data)
                };
                tx.onerror = function(event) {
                    reject('添加数据失败')
                };
            })

        })).catch(err=>{
            throw err;
        })
    },
    addItems(name,dataList){
        return  Promise.resolve().then(idb.open().then(db=>{
            let tx = db.transaction(name, 'readwrite');
            let store = tx.objectStore(name);
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
        })).catch(err=>{
            throw err;
        })
    }
}
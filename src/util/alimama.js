'use strict';
let  axios = require('axios'); 
let alimama = {
    /* 
        模拟阿里妈妈登录
        @method
    */
    login(){
        let params = 'http://login.taobao.com/member/taobaoke/login.htm?is_login=1'
            ,data = { TPL_username:'%BA%CE%C0%FB%BE%FC99', TPL_password:'', ncoSig:'', ncoSessionid:'', ncoToken:'a9b6780923bbe007aa517fb1d6f772841db25308', slideCodeShow:	false, useMobile:	false, lang:'zh_CN', loginsite:0, newlogin:0, TPL_redirect_url:'http://login.taobao.com/member/taobaoke/login.htm?is_login=1', from:'alimama', fc:'default', style:'mini', css_style:'', keyLogin:false, qrLogin:true, newMini:false, newMini2:true, tid:'', loginType:3, minititle:'', minipara:'', pstrong:'', sign:'', need_sign:'', isIgnore:'', full_redirect:true, sub_jump:'', popid:'', callback:'', guf:'', not_duplite_str:'', need_user_id:'', poy:'', gvfdcname:10, gvfdcre:'68747470733A2F2F7777772E616C696D616D612E636F6D2F6D656D6265722F6C6F67696E2E68746D', from_encoding:'', sub:'', TPL_password_2:'	027d73c61629b5b20b763d6cda1c7fc90ee265619c86c4e369690431637f25f18513f7c9cf01c62727e03e2e8c1120e5130028e1d7b30ef24e38177039fde57c181402e3641332c8d4f006e26eb39af4dc492e0be6930b1181c45ae6475e6e1e5315c2e36a79be32b53e8a4406fc253bbb0dab812aa21ee0dba82db371d1c30d', loginASR:1, loginASRSuc:1, allp:'', oslanguage:'zh-CN', sr:'1920*1080', osVer:'', naviVer:'chrome|59.0307186', osACN:'Mozilla', osAV:'5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.86 Safari/537.36', osPF:'Win32', miserHardInfo:'', appkey:'', nickLoginLink:'', mobileLoginLink:'https://login.taobao.com/member/login.jhtml?style=mini&newMini2=true&from=alimama&redirectURL=http://login.taobao.com/member/taobaoke/login.htm?is_login=1&full_redirect=true&disableQuickLogin=true&useMobile=true', showAssistantLink:'', um_token:'HV01PAAZ0b85ebd67ac32dbb5977512200b55297', ua:'095#6ULotwoYo8IocERZoooooPL7/82LUPL9T12owPClUOcVzPHh/FNQ8j6xR8uEJjAyoiuiGfCU1bc5JPHdT+uFHfCdoBuEwCiRoRIj+SDkzqHF8qx5aMFlEKE58SWG6hiRoRIjZSDkzsHV6dfzbdOEy8qkNPAQDbeRoRQjZeALd+a+ZUySjeItqqx5T2aGTo0R8SXS/6eRooIdck7xnwLoAog+c9Kw80F36K5v6M0jz8YhTfy7vILojEt+FeIl1m1+jvPjboGW6Kh98eI966QhTKlmxwLoPw6+3OIE1byJBMbQondvsY/RoRHjZhULLJOYgdQVtwETE2xUNPtfupKqWUHRoob+ZStR2ILoR3iPcebp1gLRoo5+qssLf/fH/uBhOXb3wgiRobR+HpD/NhL5c4EHjj/+X8uScytP6pdm84Yf/AEVZ6xUsp0Ubf/+X8uScytD20GYctlhNOhQc/x7/SKSLMQkEqfSc8TAGMGvzgLMTFO8r/xJcgN7axFdeSxUTgcACp0RqMEW3aiw6hfbj6XYDXAywRExFbE0Dyfts8uScyFwTVQw84Yfa0/BeRxtj06KCplm/pxbjo6kAYjJsn0Jf0ikeRxtj06guSMHcyYSNaVyYH0YC8NhK0EiF8TkFbE0DSZLLnu5ca/gCtoU/SxUaPRzEpx5/b6p2M0OTPfUVeCsT6hWs8uSfmF3y4XUTSWPc0PrWVKlzFRqTVXSsKB7aXQwX8ffsgAK6nKvWnfk/WhqZte5sIHRooxPEdGcgMljPdORooY0oA6rLdQ2oIoQZ9i9bAr7Z91+ZSYKO+m+091+TTbp1ILgZ9iwUAr7oID+ZSPLO+ORRlFRooMN/EqD3ILoRPC9gfCroIoLTntsYQ/RooW++SsAI+OYhMx2oIoro31cb0+7jNh+6jE0rCG7xwLoAwt+xeIK1byJ9xW30odoz2LhcWYVcqqm3ILoRPC9gfumoIotR3i9bjLpI0F36fEeTQKhz8YhOUsxyKBhz6eRooIdck7x' };
    },
    getAdZone(){
        let url = 'http://pub.alimama.com/common/adzone/newSelfAdzone2.json?tag=29&itemId=552220693426&blockId=&t=1500866067226&_tb_token_=qZfgrBNDmpq&pvid=10_222.188.153.160_576_1500862980397';
        let params = {

        }
    },
    /* 
        维持阿里妈妈session登录状态
    */
    refreshSesson(){
        function refresh(){
            axios.get('https://anyservice.taobao.com/window/getAnywhereContent.do?anyconditions=%7B%22isInit%22%3Atrue%7D&from=anywhere&sourceId=434&sourceUrl=https%3A%2F%2Fwww.alimama.com%2Findex.htm&bizCode=PCMaMaAnyWhereWindow&callback=anywhere_jsonp_getAnywhereContent&_input_charset=UTF-8').then(res=>{
                return axios.get('https://anyhelp.taobao.com/window/getUserStateInfo.do?target=1&from=anywhere&sourceId=434&sourceUrl=https%3A%2F%2Fwww.alimama.com%2Findex.htm&requestId=&bizCode=PCMaMaAnyWhereWindow&callback=anywhere_jsonp_2&_input_charset=UTF-8')
            }).then(res=>{
                localStorage.alimama_session_activetime = Date.now();
                console.debug('更新alimama session',res.data);
                // 20分钟更新一次session
                setTimeout(refresh,20*60*1000);
            })
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
                // 定时更新session
                if(!localStorage.alimama_session_activetime){
                    alimama.refreshSesson();
                }
                return res.data;
            }).catch(err=>{
                throw err;
            });
        })
    }
}

exports = module.exports = alimama;



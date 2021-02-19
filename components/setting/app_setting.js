/*
 * モジュール名 : SafetytipsAPI
 * 作成日 ：2020/12/08
 * 作成者 : NEC
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */

import appConfig from '../../app.json';
import { isEmpty } from '../common/utils';
//import DeviceInfo from 'react-native-device-info'; // 利用しない
import iid from '@react-native-firebase/iid';
import { Platform } from 'react-native';

/**
* 【Safetytips】クライアント設定値取得API
* @param  {String}  noticeLang      //通知言語
* @param  {array}  params           //パラメータ
* @return {String}       
*/
export async function getDataMunicipality(noticeLang, params) {
    //API取得結果
    var rtn = await getDataAPI.getData(noticeLang, params);
    if (rtn.success) {
        return rtn.data;
    } else {
        return rtn.error;
    }
}

/**
* 【Safetytips】PUSH設定保存
* @param  {String}  noticeLang      //通知言語
* @param  {Number}  ispush          //PUSH通知有無 0：プッシュしない　1：プッシュする
* @param  {array}   params          //パラメータ
* @return {String}       
*/
export async function setDataPushNotice(noticeLang, ispush, params) {
    //設定値
    const old_destination = await iid().getToken(); //旧　PUSH送信先情報
    const new_destination = old_destination;        //新　PUSH送信先情報
    const number = params.point;                    //地点設定番号
    const device = Platform.OS;                     //デバイスタイプ 'android', 'ios'
    const is_debug = appConfig.safetyTips.pushSetting.is_debug; //0：プッシュしない　1：プッシュする

    //プッシュ通知設定
    var rtn = await setDataAPI.setData(old_destination, new_destination, number, device, noticeLang, ispush, is_debug, params);
    if (rtn.success) {
        return rtn.data;
    } else {
        return rtn.error;
    }
}

/**
* 【Safetytips】PUSH通知テスト
* @param  {String}  type      //PUSH種別
* @param  {Number}  lat       //テスト通知を行う地点の緯度
* @param  {Number}   lon       //テスト通知を行う地点の経度
* @return {String}       
*/
export async function getPushNoticeTest(type, lat, lon){
    //API取得結果
    var rtn = await getPushTestAPI.getData(type, lat, lon);
    
    if (rtn.success) {
        return rtn.data;
    } else {
        return rtn.error;
    }
}

//名称切り替え
function getName(noticeLang, value) {
    var name = "";
    switch (noticeLang) {
        case "ja": //'日本語'
            name = value.name_ja;
            break;
        case "en": //'英語'
            name = value.name_en;
            break;
        case "zhs": //'中国語'
            name = value.name_zhs;
            break;
        default:
            name = value.name_ja;
    }
    return name;
}

//クライアント設定値取得API呼び出し
const getDataAPI = {
    async getData(noticeLang, params) {
        const { city_code, village_code, prefecture_code, region_code } = params;

        var url = 'https://safetytips-cloud.com/api/v1/appsettings';
        let param = {
            type: "prefecture",
            lang: noticeLang //言語キー
        };
        let queryParameters = [];
        for (let key in param) {
            let encodedKey = encodeURIComponent(key);
            let encodedValue = encodeURIComponent(param[key]);
            queryParameters.push(encodedKey + '=' + encodedValue);
        }
        queryParameters = queryParameters.join('&');
        //console.log("地方コード：" + region_code);
        //console.log("都道府県コード：" + prefecture_code);
        //console.log("市町村コード：" + city_code);
        //console.log("村域コード：" + village_code);

        var response = await fetch(url + "?" + queryParameters, {
            protocol: 'https',
            method: 'GET',
            path: '/api/v1/appsettings',
            headers: {
                Accept: 'application/json',
                'x-api-key': appConfig.safetyTips.APIKey
            },
        })
            .then(serviceResponse => {
                return serviceResponse.json();
            })
            .then(serviceResponse => {
                //sucsess
                //データ取得
                let data1 = serviceResponse['setting']['prefectures'];
                let data2 = serviceResponse['setting']['cities'];
                let data3 = serviceResponse['setting']['villages'];

                //名称格納用
                let prefectures = "";
                let cities = "";
                let villages = "";

                //コード格納用
                let region_data;
                let prefecture_data;
                let city_data;
                let villag_data;

                //都道府県名
                region_data = data1.filter(target => {
                    return target.region_code == region_code;
                });
                prefecture_data = region_data.filter(target => {
                    return target.code == prefecture_code;
                });
                prefecture_data.map((value) => {
                    prefectures = getName(noticeLang, value);
                });

                //市町村名
                region_data = data2.filter(target => {
                    return target.region_code == region_code;
                });
                prefecture_data = region_data.filter(target => {
                    return target.prefecture_code == prefecture_code;
                });
                city_data = prefecture_data.filter(target => {
                    return target.code == city_code;
                });
                city_data.map((value) => {
                    cities = getName(noticeLang, value);
                });

                //村域以下がある場合
                if (!isEmpty(village_code)) {
                    //村域
                    region_data = data3.filter(target => {
                        return target.region_code == region_code;
                    });
                    prefecture_data = region_data.filter(target => {
                        return target.prefecture_code == prefecture_code;
                    });
                    city_data = prefecture_data.filter(target => {
                        return target.city_code == city_code;
                    });
                    villag_data = city_data.filter(target => {
                        return target.code == village_code;
                    });
                    if (!isEmpty(villag_data)) {
                        villag_data.map((value) => {
                            villages = getName(noticeLang, value);
                        });
                    }
                }
                //戻り値設定
                let data = "";
                if (noticeLang === "en") {
                    data = villages + " " + cities + " " + prefectures;
                } else {
                    data = prefectures + " " + cities + " " + villages;
                }

                return { success: true, data };
            })
            .catch((error) => {
                return { success: false, error };
            });
        return response;
    }
};

//プッシュ通知保存API呼び出し
const setDataAPI = {
    async setData(old_destination, new_destination, number, device, noticeLang, is_push, is_debug, data) {
        var url = 'https://safetytips-cloud.com/api/v1/settings';
        let formBody = {
            old_destination: old_destination,   //旧　PUSH送信先情報
            new_destination: new_destination,   //新　PUSH送信先情報
            number: number,                     //地点設定番号
            device: device,                     //デバイスタイプ
            lang: noticeLang,                   //言語
            is_push: is_push,                   //プッシュ通知の受信可否
            is_debug: is_debug,                 //デバッグプッシュ通知の受信可否
        };
        const villages = {
            region_code: data.region_code,          //地方コード
            prefecture_code: data.prefecture_code,  //都道府県コード
            city_code: data.city_code,              //市区町村コード
            village_code: data.village_code         //村域以下コード
        }
        const cities = {
            region_code: data.region_code,          //地方コード
            prefecture_code: data.prefecture_code,  //都道府県コード
            city_code: data.city_code,              //市区町村コード
        }

        //村域以下有無より設定値制御
        if (isEmpty(data.village_code)) {
            formBody['municipality'] = cities;
        } else {
            formBody['municipality'] = villages;
        }

        var response = await fetch(url, {
            protocol: 'https',
            method: 'POST',
            body: JSON.stringify(formBody),
            path: '/api/v1/settings',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'x-api-key': appConfig.safetyTips.APIKey
            },
        })
            .then(serviceResponse => {
                return serviceResponse.json();
            })
            .then(serviceResponse => {
                //sucsess
                const data = serviceResponse['municipality'];
                return { success: true, data };
            })
            .catch((error) => {
                console.log(error);
                return { success: false, error };
            });
        return response;
    }
};

//プッシュ通知テストAPI呼び出し
const getPushTestAPI = {
    async getData(type, lat, lon) {
        var url = 'https://safetytips-cloud.com/api/v1/pushtest';
        let param = {
            type: type, //PUSH種別  earthquake：緊急地震速報PUSH　weather：気象特別警報PUSH tsunami：津波速報PUSH　eruption：噴火速報PUSH　heatillness：熱中症PUSH
            lat: lat,   //緯度
            lang: lon   //経度
        };
        let queryParameters = [];
        for (let key in param) {
            let encodedKey = encodeURIComponent(key);
            let encodedValue = encodeURIComponent(param[key]);
            queryParameters.push(encodedKey + '=' + encodedValue);
        }
        queryParameters = queryParameters.join('&');

        var response = await fetch(url + "?" + queryParameters, {
            protocol: 'https',
            method: 'GET',
            path: '/api/v1/pushtest',
            headers: {
                Accept: 'application/json',
                'x-api-key': appConfig.safetyTips.APIKey
            },
        })
            .then(serviceResponse => {
                return serviceResponse.json();
            })
            .then(serviceResponse => {
                //sucsess
                let data = serviceResponse['result'];
                return { success: true, data };
            })
            .catch((error) => {
                console.log(error);
                return { success: false, error };
            });
        return response;
    }
};
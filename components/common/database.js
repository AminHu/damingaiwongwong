/*
 * モジュール名 : 共通モジュール
 * 作成日 ：2020/11/11
 * 作成者 : NEC
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */

//import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 管理ソールと一致するため、言語のコードを変換する
async function GetLanguageSetting() {
    let rtnLang = "";

    // 現在の言語を取得する
    const currentLang = await AsyncStorage.getItem('lang');
    switch (currentLang) {
        case 'ja':  // 日本語	jp
            rtnLang = "jp";
            break;
        case 'en':  // 英語	us
            rtnLang = "en";
            break;
        case 'vi':  // ベトナム語	vn
            rtnLang = "vn";
            break;
        case 'zh':  // 中国語（簡）	ch
            rtnLang = "ch";
            break;
        case 'ph':  // フィリピン語	 ph
            rtnLang = "ph";
            break;
        case 'id':  // インドネシア語 id
            rtnLang = "id";
            break;
        case 'th':  // タイ語	th
            rtnLang = "th";
            break;
        case 'km':  // カンボジア語	kh
            rtnLang = "kh";
            break;
        case 'my':  // ミャンマー語	mm
            rtnLang = "mm";
            break;
        case 'mn':  // モンゴル語	mn
            rtnLang = "mn";
            break;
        default:
            rtnLang = "jp";
    }

    return rtnLang;
}

// FirestoreのTimestampをフォマットする
// TO : YYYY/MM/DD HH:MI
function GetDateFromTimestamp(timestamp) {
    let CurrentDate = "";
    let date = timestamp.toDate();

    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    let hour = date.getHours();
    let minute = date.getMinutes();

    CurrentDate += year + "/";

    if (month >= 10) {
        CurrentDate += month + "/";
    }
    else {
        CurrentDate += "0" + month + "/";
    }

    if (day >= 10) {
        CurrentDate += day;
    }
    else {
        CurrentDate += "0" + day;
    }

    if (hour >= 10) {
        CurrentDate += " " + hour;
    }
    else {
        CurrentDate += " 0" + hour;
    }

    if (minute >= 10) {
        CurrentDate += ":" + minute;
    }
    else {
        CurrentDate += ":0" + minute;
    }

    return CurrentDate;
}

// お知らせデータを取得する
export async function GetNoticeData() {
    let arrNoticeData = [];
    let noticeCollection = "notice_" + await GetLanguageSetting(); // "notice_jp"

    var rtnResult = await firestore()
        .collectionGroup(noticeCollection)
        .where("dispflag", "==", true).where("deleteflag", "==", false).orderBy("createdAt", "desc")
        .get().then(querySnapshot => {
            let index = 1;
            querySnapshot.forEach(doc => {
                if (doc.exists) {
                    docValue = doc.data();

                    let datetime = "";
                    if (typeof docValue.createdAt !== "undefined" && docValue.createdAt !== null) {
                        datetime = GetDateFromTimestamp(docValue.createdAt);
                    }
                    else {
                        datetime = "";
                    }
                    let arrTMP = { "key": index, "datetime": datetime, "notice": docValue.title, "detail": docValue.notificationData };
                    arrNoticeData.push(arrTMP);
                    index++;
                }
            });
            //データ取得成功
            return { success: true, data: arrNoticeData };
        }).catch((error) => {
            //データ取得エラー
            console.error("お知らせデータ取得error: ", error);
            return { success: false, error };
        });

    return rtnResult;
}

// 事務所データを取得する
export async function GetOfficeData() {
    let arrOfficeData = [];
    let officeCollection = "office_" + await GetLanguageSetting(); // office_jp"

    var rtnResult = await firestore()
        .collectionGroup(officeCollection)
        .where("deleteflag", "==", false).orderBy("officeId", "ASC")

        .get().then(querySnapshot => {
            let index = 1;
            querySnapshot.forEach(doc => {
                if (doc.exists) {
                    docValue = doc.data();
                    let arrTMP = { "key": index, "officeName": docValue.officeName, "address": docValue.addr, "searchAddr": docValue.addr };
                    arrOfficeData.push(arrTMP);
                    index++;
                }
            });
            //データ取得成功
            return { success: true, data: arrOfficeData };
        }).catch((error) => {
            //データ取得エラー
            console.error("事務所データを取得error: ", error);
            return { success: false, error };
        });

    return rtnResult;
}

// 大使館データを取得する
export async function GetEmbassyData() {
    let arrEmbassyData = [];
    let embassyCollection = "embassy_" + await GetLanguageSetting(); // embassy_jp"

    var rtnResult = await firestore()
        .collectionGroup(embassyCollection)
        .where("deleteflag", "==", false).orderBy("sortKey", "ASC")

        .get().then(querySnapshot => {
            let index = 1;
            querySnapshot.forEach(doc => {
                if (doc.exists) {
                    docValue = doc.data();
                    let arrTMP = { "key": index, "embassyName": docValue.embassyName, "embassyURL": docValue.url };
                    arrEmbassyData.push(arrTMP);
                    index++;
                }
            });
            //データ取得成功
            return { success: true, data: arrEmbassyData };
        }).catch((error) => {
            //データ取得エラー
            console.error("大使館データを取得error: ", error);
            return { success: false, error };
        });

    return rtnResult;
}

// ヘルプデータを取得する 
export async function GetHelpData() {
    let arrHelpData = [];
    let helpCollection = "help_" + await GetLanguageSetting(); // help_jp

    var rtnResult = await firestore()
        .collectionGroup(helpCollection)
        .where("deleteflag", "==", false).where("category", "==", "ヘルプ").orderBy("sortKey", "ASC")

        .get().then(querySnapshot => {
            let index = 1;
            querySnapshot.forEach(doc => {
                if (doc.exists) {
                    docValue = doc.data();
                    let arrTMP = { "key": index, "question": docValue.title, "answer": docValue.helpData };
                    arrHelpData.push(arrTMP);
                    index++;
                }
            });
            //データ取得成功
            return { success: true, data: arrHelpData };
        }).catch((error) => {
            //データ取得エラー
            console.error("ヘルプデータを取得error: ", error);
            return { success: false, error };
        });

    return rtnResult;
}

// FAQデータを取得する 
export async function GetFAQData() {
    let arrFAQData = [];
    let faqCollection = "help_" + await GetLanguageSetting(); // help_jp

    var rtnResult = await firestore()
        .collectionGroup(faqCollection)
        .where("deleteflag", "==", false).where("category", "==", "FAQ").orderBy("sortKey", "ASC")

        .get().then(querySnapshot => {
            let index = 1;
            querySnapshot.forEach(doc => {
                //console.log("docValue :", docValue);
                if (doc.exists) {
                    docValue = doc.data();
                    let arrTMP = { "key": index, "question": docValue.title, "answer": docValue.helpData };
                    arrFAQData.push(arrTMP);
                    index++;
                }
            });
            //データ取得成功
            return { success: true, data: arrFAQData };
        }).catch((error) => {
            //データ取得エラー
            console.error("FAQデータ取得error: ", error);
            return { success: false, error };
        });

    return rtnResult;
}

// アンケートデータを取得する 
export async function GetQuestionaireData() {
    let arrQuestionaireData = [];
    let questionaireCollection = "questionnaire_" + await GetLanguageSetting(); // 単体テスト

    //let questionaireCollection = "questionnaire_" + await GetLanguageSetting(); // 仕様書の名称が不一致になっている

    var rtnResult = await firestore()
        .collectionGroup(questionaireCollection)  // 正式版適用
        .where("dispflag", "==", true).where("deleteflag", "==", false).orderBy("createdAt", "DESC")

        .get().then(querySnapshot => {
            let index = 1;
            querySnapshot.forEach(doc => {
                if (doc.exists) {
                    docValue = doc.data();
                    // 発信日時を変換する
                    let datetime = GetDateFromTimestamp(docValue.createdAt);
                    let arrTMP = { "key": index, "datetime": datetime, "detail": docValue.title, "url": docValue.url };
                    arrQuestionaireData.push(arrTMP);
                    index++;
                }
            });
            //データ取得成功
            return { success: true, data: arrQuestionaireData };
        }).catch((error) => {
            //データ取得エラー
            console.error("アンケートデータ取得error: ", error);
            return { success: false, error };
        });

    return rtnResult;
}

// HandBookのホスティングＵＲＬを取得する
export async function GetHandBookHostingURL() {
    let strHandBookHostingURL = "";

    const envQuery = await firestore()
        .collection('system')
        .doc('env')
        .get()
        ;

    //console.log("PDF Hosting Data : ",envQuery.data());
    strHandBookHostingURL = envQuery.data().mobileapp.url.pdfviewerhost;
    //console.log("PDF Hosting URL : ",strHandBookHostingURL);

    return strHandBookHostingURL;
}

// HandBookのURLを取得する
export async function GetHandbookPDFURL() {
    let arrHandbookPDFURL = [];

    var rtnResult = await firestore()
        .collection("handbookInfo")  // 正式版適用
        .get().then(querySnapshot => {
            let index = 1;
            querySnapshot.forEach(doc => {
                if (doc.exists) {
                    docValue = doc.data();
                    //console.log(docValue.handbook);
                    arrHandbookPDFURL = docValue.handbook;
                    index++;
                }
            });
            //データ取得成功
            return { success: true, data: arrHandbookPDFURL };
        }).catch((error) => {
            //データ取得エラー
            console.error("HandbookのＰＤＦＵＲＬを取得 : Error",error);
            return { success: false, error };
        });

    return rtnResult;
}

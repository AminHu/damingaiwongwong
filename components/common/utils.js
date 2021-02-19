/*
 * モジュール名 : 共通モジュール
 * 作成日 ：2020/11/11
 * 作成者 : Oushibu
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */

 /**
 * フィールドによってJsonデータをソートする
 * @param  {Array}   array   Jsonデータ
 * @param  {String}  field   ソートフィールド
 * @param　{Boolean} reverse true: 昇順 false: 降順
 * @return {Array}           ソートしたJsonデータ
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export function SortJsonData(array, field, reverse) {
    // Jsonデータではない場合、直接arrayをリターンする
    if(array.length < 2 || !field || typeof array[0] !== "object") 
        return array;
    
    // 数字でソート
    if(typeof array[0][field] === "number") {
        array.sort(function(x, y) { return x[field] - y[field]});
    }
    
    // 文字列でソート
    if(typeof array[0][field] === "string") {
        array.sort(function(x, y) { return x[field].localeCompare(y[field])});
    }
    
    // 逆順
    if (reverse) {
        array.reverse();
    }
    
    return array;
}
;

 /**
 * 条件によってJsonデータのレコードを削除する
 * @param  {Array}  datas           Jsonデータ
 * @param  {String} fieldName       フィールド Name
 * @param　{String} fieldIndex      フィールド Index
 * @param　{String} deleteCondition 削除条件
 * @return {Array}                  削除したJsonファイル
 */
export function DeleteJsonData(datas, fieldName = "", fieldIndex = "",deleteCondition = "") {
    console.log("filed name : " + fieldName);
    console.log("filed index : " + fieldIndex);
    console.log("delete condition : " + deleteCondition);

    if (fieldName !== "") {
        console.log("filed Name Is Not Blank !");

        for (let i= datas.length -1 ; i>=0 ; i--)
        {
          //console.log("data : " + datas[i]["key"]);

          if (datas[i][fieldName] === deleteCondition)
          {
            //console.log("delete data : " + datas[i][fieldName]);
            datas.splice(i,1);
          }
        }

    }
    else if (fieldIndex !== "") {
        console.log("filed Index Is Not Blank !");

        for (let i= datas.length -1 ; i>=0 ; i--)
        {
          //console.log("data : " + datas[i]["key"]);

          if (datas[i][fieldIndex] === deleteCondition)
          {
            //console.log("delete data : " + datas[i][fieldIndex]);
            datas.splice(i,1);
          }
        }
    }
    else {
        console.log("filed Name Is Blank !");
        console.log("filed Index Is Blank !");
    }

    return datas;
}
;

/**
* 値の空白チェック
* @param  {String}  val   対象データ
* @return {Boolean}       true: 空 false: 空ではない
*/
export function isEmpty(val) {
  if (!val) {//null or undefined or ''(空文字) or 0 or false
    if (val !== 0 && val !== false) {
      return true;
    }
  } else if (typeof val === "object" || typeof val === 'undefined') {//array or object
    return Object.keys(val).length === 0;
  }
  return false;//値は空ではない
}

/**
* 母国語相談URLを取得する
* @return {String}          各国の相談画面のURL
*/
export async function GetTalkURL() {
  const language = await AsyncStorage.getItem('lang');
  let sURL = '';

  switch (language) {
    case 'ja': // 日本語
      sURL = "https://www.support.otit.go.jp/soudan/jpindex.html";
      break;
    case 'en': // 英語
      sURL = "https://www.support.otit.go.jp/soudan/en/";
      break;
    case 'vi': // ベトナム語
      sURL = "https://www.support.otit.go.jp/soudan/vi/";
      break;
    case 'zh': // 中国語
      sURL = "https://www.support.otit.go.jp/soudan/cn/";
      break;
    case 'ph': // フィリピン語 タガログ語
      sURL = "https://www.support.otit.go.jp/soudan/phi/";
      break;
    case 'id': // インドネシア語
      sURL = "https://www.support.otit.go.jp/soudan/id/";
      break;
    case 'th': // タイ語
      sURL = "https://www.support.otit.go.jp/soudan/th/";
      break;
    case 'km': // カンボジア語
      sURL = "https://www.support.otit.go.jp/soudan/kh/";
      break;
    case 'my': // ミャンマー語
      sURL = "https://www.support.otit.go.jp/soudan/mm/";
      break;
    default:   // 上記以外の場合　（モンゴル語：要件に母国語相談ボタンもない）
      sURL = "https://www.support.otit.go.jp/soudan/jpindex.html";
  }

  return sURL;
}

// App言語によってFirebase Storeの言語に変換する
export async function GetBackendLanguage(applanguage) {
  let rtnLang = "";

  switch (applanguage) {
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
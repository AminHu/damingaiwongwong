/*
 * モジュール名 : 地図表示コンポーネント
 * 作成日 ：2020/11/27
 * 作成者 : NEC
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */
import React, { Component } from 'react';
import { Dimensions, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class MapDisplay extends Component {
  constructor() {
    super();
    this.state = {
      searchURL : '',
    }
  }

  // 検索用のURLを取得する
  async GetMapURL(address) {
    //const sURL = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address)
    let sURL = "https://www.google.com/maps/search/?api=1&hl=";

    // 現在の言語を取得する
    const currentLang = await AsyncStorage.getItem('lang'); 
    switch (currentLang) {
      case 'ja':  // 日本語	jp
        sURL += "ja";
        break;
      case 'en':  // 英語	us
        sURL += "en";
        break;
      case 'vi':  // ベトナム語	vn
        sURL += "vi";
        break;
      case 'zh':  // 中国語（簡）	ch
        sURL += "zh-CN";
        break;
      case 'ph':  // フィリピン語	 ph
        sURL += "fil";
        break;
      case 'id':  // インドネシア語 id
        sURL += "id";
        break;
      case 'th':  // タイ語	th
        sURL += "th";
        break;
      case 'km':  // カンボジア語	kh
        sURL += "km";
        break;
      case 'my':  // ミャンマー語	mm
        sURL += "my";
        break;
      case 'mn':  // モンゴル語	mn
        sURL += "mn";
        break;
      default:
        sURL += "jp";
    }

    sURL += "&query=" + encodeURIComponent(address);

    console.log("検索用ＵＲＬ::::::::", sURL);
    return sURL;
  }

  async componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', async () => {
      // 画面タイトルを変更する
      const { officeName } = this.props.route.params;
      const { setOptions } = this.props.navigation;
      setOptions({ title: officeName })

      // 詳細画面から別画面に遷移した後、自動で事務所一覧に戻ります。

      const sAutoReturnForOffice =  await AsyncStorage.getItem('AutoReturnForOffice');

      if (sAutoReturnForOffice !== null && sAutoReturnForOffice == "Yes") {
        //this.props.navigation.navigate("OfficeScreen");
        this.props.navigation.popToTop();
      }

      await AsyncStorage.setItem('AutoReturnForOffice','Yes');

      const { searchAddr } = this.props.route.params;      
      this.setState({searchURL : await this.GetMapURL(searchAddr)});

    });
  }

  //[*]コンポーネントのアンマウント
  async componentWillUnmount() {
    this._unsubscribe();
  }

  render() {
    //const { searchAddr } = this.props.route.params;
    //let sURI = this.GetMapURL(searchAddr);

    return (
      <WebView source={{
        uri: this.state.searchURL,
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      }}
        originWhitelist={["*"]}  // originWhitelist={["file://","intent://"]} 
        style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height }}
        geolocationEnabled={true}
        javaScriptEnabled={true}
        allowUniversalAccessFromFileURLs={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        useWebKit={true}
        onShouldStartLoadWithRequest={event => {
          console.log("event.url : ",event.url);
          if (event.url.match(/(goo\.gl\/maps)|(maps\.app\.goo\.gl)/)) {
            Linking.openURL(event.url)
            return false
          }
          return true
        }}
      />);
  }
}
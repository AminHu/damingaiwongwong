/*
 * モジュール名 : 利用規約コンポーネント
 * 作成日 ：2020/11/24
 * 作成者 : NEC
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */
import React, { Component } from 'react';
import { Container, Content, Text, Button, Form, Footer, FooterTab} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18n-js';
//import styles from '../common/style';
import { Asset } from 'expo-asset'
import * as FileSystem from 'expo-file-system';
import { ScaledSheet } from 'react-native-size-matters';

//コンポーネントの内容を定義
export default class PolicyScreen extends Component {
  constructor() {
    super()
    this.state = {
      screenId: 'HBA-1000',
      currentLang: i18n.locale,
      displayAggree: true,
      policyHTML: "",
    };
  }

  // [*] イベント処理
  onPress() {
    this.props.navigation.navigate('FirstStartNoticeSetScreen'); // NoticeSetScreen
  }

  async componentDidMount() {
    // 同意ボタンの多言語対応するため、リスナーを追加します。
    this._unsubscribe = this.props.navigation.addListener('focus', async () => {
      const langValue = await AsyncStorage.getItem('lang');
      i18n.locale = langValue;

      const { setOptions } = this.props.navigation;
      setOptions({ title: i18n.t('HBA-2000-policy') });

      this.setState({ currentLang: i18n.locale });

      //利用規約切替
      let PolicyURL = "";
      switch (langValue) {
        case 'ja':
          PolicyURL = require('../../policy/policy_jpn.html'); // 日本語
          break;
        case 'en':
          PolicyURL = require('../../policy/policy_eng.html'); // 英語
          break;
        case 'vi':
          PolicyURL = require('../../policy/policy_vie.html'); // ベトナム語
          break;
        case 'zh':
          PolicyURL = require('../../policy/policy_zho.html'); // 中国語
          break;
        case 'ph':
          PolicyURL = require('../../policy/policy_phi.html'); // フィリピン語
          break;
        case 'id':
          PolicyURL = require('../../policy/policy_ind.html'); // インドネシア語
          break;
        case 'th':
          PolicyURL = require('../../policy/policy_tha.html'); // タイ語
          break;
        case 'km':
          PolicyURL = require('../../policy/policy_khm.html'); // カンボジア語
          break;
        case 'my':
          PolicyURL = require('../../policy/policy_mya.html'); // ミャンマー語
          break;
        case 'mn':
          PolicyURL = require('../../policy/policy_mon.html'); // モンゴル語
          break;
        default:
          PolicyURL = require('../../policy/policy_jpn.html');
      }

      const policyHtml = Asset.fromModule(PolicyURL);
      await policyHtml.downloadAsync();
      const HTMLFile = await FileSystem.readAsStringAsync(policyHtml.localUri);
      this.setState({ PolicyHTML: HTMLFile });

    });

    // 他画面に遷移する時、自動でTopに戻る
    this._unsubscribe2 = this.props.navigation.addListener('blur', async () => {
      this.component._root.scrollToPosition(0, 0);
    });    

    // 初回起動ではない場合、[同意する]を非表示にする
    const sFirst = await AsyncStorage.getItem('FirstStart');
    if (sFirst === "false") {
      this.setState({ displayAggree: false });
    }
  }

  componentWillUnmount() {
    try {
      this._unsubscribe();
      this._unsubscribe2();
    }
    catch (e) { }
  }
  
  //表示する要素を返す
  render() {
    return (

      <Container>
        <Content ref={c => (this.component = c)}>
          <Form>
            <Text>{this.state.PolicyHTML}</Text>

            <Text style={{textAlign:"left",}}>_____________________________________</Text>
            <Text style={styles.textrow}>About OSS packages included in app</Text>
            <Text style={styles.textrow2}>[PackageName/Ver./License/URL]</Text>
            <Text style={{textAlign:"left",}}>_____________________________________</Text>

            <Text style={styles.textrow2}></Text>
            <Text style={styles.textrow2}>expo	~39.0.2	MIT</Text>
            <Text style={styles.textrow2}>expo-asset	^8.2.1	MIT</Text>
            <Text style={styles.textrow2}>expo-constants	~9.2.0	MIT</Text>
            <Text style={styles.textrow2}>expo-file-system	~9.2.0	MIT</Text>
            <Text style={styles.textrow2}>expo-font	~8.3.0	MIT</Text>
            <Text style={styles.textrow2}>expo-localization	~9.0.0	MIT</Text>
            <Text style={styles.textrow2}>expo-location	~9.0.0	MIT</Text>
            <Text style={styles.textrow2}>expo-notifications	~0.7.2	MIT</Text>
            <Text style={styles.textrow2}>expo-permissions	~9.3.0	MIT</Text>
            <Text style={styles.textrow2}>expo-splash-screen	~0.6.2	MIT</Text>
            <Text style={styles.textrow2}>expo-status-bar	~1.0.2	MIT</Text>
            <Text style={styles.textrow2}>expo-updates	~0.3.2	MIT</Text>
            <Text style={styles.textrow2}>https://expo.io/</Text>
            <Text style={styles.textrow2}>native-base	^2.13.14	Apache-2.0</Text>
            <Text style={styles.textrow2}>https://nativebase.io/</Text>
            <Text style={styles.textrow2}>react-native-async-storage	^1.13.2	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/react-native-async-storage/async-storage</Text>
            <Text style={styles.textrow2}>react-native-community	^0.5.5	Apache-2.0</Text>
            <Text style={styles.textrow2}>https://github.com/ericvicenti/react-native-community</Text>
            <Text style={styles.textrow2}>react-native-firebase	^10.0.0	Apache-2.0</Text>
            <Text style={styles.textrow2}>https://github.com/invertase/react-native-firebase</Text>
            <Text style={styles.textrow2}>react-navigation	4.4.3	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/react-navigation/react-navigation</Text>
            <Text style={styles.textrow2}>react	16.13.1	MIT</Text>
            <Text style={styles.textrow2}>https://reactjs.org/</Text>
            <Text style={styles.textrow2}>react-accessible-accordion	^3.3.3	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/springload/react-accessible-accordion</Text>
            <Text style={styles.textrow2}>react-dom	16.13.1	MIT</Text>
            <Text style={styles.textrow2}>https://reactjs.org/</Text>
            <Text style={styles.textrow2}>react-native	~0.63.3	MIT</Text>
            <Text style={styles.textrow2}>https://reactjs.org/</Text>
            <Text style={styles.textrow2}>react-native-autolink	^3.0.0	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/joshswan/react-native-autolink</Text>
            <Text style={styles.textrow2}>react-native-btr	^1.1.5	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/thakurballary/react-native-btr</Text>
            <Text style={styles.textrow2}>react-native-check-app-install	^0.0.5	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/redpandatronicsuk/react-native-check-app-install</Text>
            <Text style={styles.textrow2}>react-native-communications	^2.2.1	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/anarchicknight/react-native-communications</Text>
            <Text style={styles.textrow2}>react-native-community-geolocation	^0.0.9	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/react-native-geolocation/react-native-geolocation</Text>
            <Text style={styles.textrow2}>react-native-dialog	^6.1.2	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/react-native-dialogs/react-native-dialogs</Text>
            <Text style={styles.textrow2}>react-native-fbsdk	^3.0.0	Facebook Platform Policy</Text>
            <Text style={styles.textrow2}>https://github.com/facebook/react-native-fbsdk</Text>
            <Text style={styles.textrow2}>react-native-geolocation-service	^5.0.0	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/Agontuk/react-native-geolocation-service</Text>
            <Text style={styles.textrow2}>react-native-gesture-handler	~1.7.0	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/software-mansion/react-native-gesture-handle</Text>
            <Text style={styles.textrow2}>react-native-icon-badge	^1.1.3	ISC</Text>
            <Text style={styles.textrow2}>https://github.com/yanqiw/react-native-icon-badge</Text>
            <Text style={styles.textrow2}>react-native-localize	^1.4.2	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/zoontek/react-native-localize</Text>
            <Text style={styles.textrow2}>react-native-maps	0.27.1	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/react-native-maps/react-native-maps</Text>
            <Text style={styles.textrow2}>react-native-maps-directions	^1.8.0	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/bramus/react-native-maps-directions</Text>
            <Text style={styles.textrow2}>react-native-pdf	^6.2.2	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/wonday/react-native-pdf</Text>
            <Text style={styles.textrow2}>react-native-reanimated	~1.13.0	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/software-mansion/react-native-reanimated</Text>
            <Text style={styles.textrow2}>react-native-render-html	^4.2.4	BSD-2-Clause</Text>
            <Text style={styles.textrow2}>https://github.com/meliorence/react-native-render-html</Text>
            <Text style={styles.textrow2}>react-native-safe-area-context	3.1.4	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/th3rdwave/react-native-safe-area-context</Text>
            <Text style={styles.textrow2}>react-native-screens	~2.10.1	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/software-mansion/react-native-screens</Text>
            <Text style={styles.textrow2}>react-native-size-matters	^0.4.0	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/nirsky/react-native-size-matters</Text>
            <Text style={styles.textrow2}>react-native-tab-view	^2.15.2	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/ptomasroos/react-native-scrollable-tab-view</Text>
            <Text style={styles.textrow2}>react-native-unimodules	~0.11.0	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/expo/expo/tree/master/packages/react-native-unimodules</Text>
            <Text style={styles.textrow2}>react-native-web	~0.13.12	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/necolas/react-native-web</Text>
            <Text style={styles.textrow2}>react-native-webview	11.0.0	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/react-native-webview/react-native-webview</Text>
            <Text style={styles.textrow2}>react-navigation	^4.4.3	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/react-navigation/react-navigation</Text>
            <Text style={styles.textrow2}>https://github.com/react-navigation/stack</Text>
            <Text style={styles.textrow2}>rn-fetch-blob	^0.12.0	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/eventsPortal/rn-fetch-blob</Text>
            <Text style={styles.textrow2}>edit-json-file	^1.5.0	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/IonicaBizau/edit-json-file</Text>
            <Text style={styles.textrow2}>i18n-js	^3.8.0	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/fnando/i18n-js</Text>
            <Text style={styles.textrow2}>load-json-file	^6.2.0	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/sindresorhus/load-json-file</Text>
            <Text style={styles.textrow2}>opencollective-postinstall	^2.0.3	MIT</Text>
            <Text style={styles.textrow2}>https://github.com/opencollective/opencollective-postinstall</Text>
            <Text style={styles.textrow2}></Text>
          </Form>
        </Content>
 

        {
          // 初回起動ではない場合、「同意する」ボタンを非表示にする
          this.state.displayAggree ? (
            <Footer>
              <FooterTab>
                <Button full info onPress={() => { this.onPress(); }}>
                  <Text style={styles.buttonTextStyle} >{i18n.t('HBA-1000-btnAgree')}</Text>
                </Button>
              </FooterTab>
            </Footer>
          ) : null
        }
      </Container>
    );
  }
}

// [*] Style設定
const styles = ScaledSheet.create({

  textrow : {
    flex: 1,
    //flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    textAlign: 'left',
    //backgroundColor: "yellow",
    marginTop: 5,
    marginLeft: 5,
    //width :400,
    fontSize:15
  }
  ,
 // 言語設定画面 -> 保存ボタン
 buttonTextStyle: {
  fontSize: '13@s',
  fontWeight: 'bold',
  textAlign: 'center',
  color: '#fff',
},
  textrow2 : {
    flex: 1,
    //flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    textAlign: 'left',
    //backgroundColor: "red",
    marginTop: 5,
    marginLeft: 5,
    //width :400,
    fontSize:10
  }
  ,


  renderItemViewLeft: {
    width: "33%",
    marginLeft: 0,
  },
  renderItemView: {
    width: "33%",
    marginLeft: 0,
  },
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
    marginTop: 0,
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5,
  },
  thumbnail: { //緑アイコンのサイズ
    width: 53,
    height: 53,
    marginLeft: 10,
  },
  rightContainer: { //手帳閲覧のセクション
    //flex: 1,
    justifyContent: "center",
    marginTop: 5,
    marginLeft: 0,
    marginRight: 0,
    alignItems: "center",
    height: '115@vs', 
  },
  title: { //手帳閲覧セクションの設定
    fontSize: '14@s',      // 手帳閲覧　Font-size 14
    marginBottom: 8,
    marginLeft: 0,
    marginTop: 2,
    textAlign: "center",
  },
  year: {
    marginLeft: 50,
    textAlign: "left",
  },

  // お知らせメッセージ
  noticeMessageText : {
    marginTop: 0, 
    marginRight: 0, 
    marginLeft: 0, 
    fontSize: '19@s',      // メッセージ Font-size  '19@ms'
    color: "red" 
  },

  // 手帳閲覧ボタン: 背景
  handbookButtonImageBackground : {
    flex: 1,
    marginLeft: 50, 
    marginRight: 50, 
    marginTop: '15@s', 
    borderRadius: 20,
    width: '320@s',   // 長さ
    height:'100@vs',   // 高さ
    overflow: "hidden", 
    alignItems: "center"
  },
  handbookButtonImage : {   // ICON
    width: '53@s', 
    height: '53@s',
    marginTop: '10@s', 
  },

  flatlist : {
    marginTop: 5, 
    marginLeft: 10, 
    marginRight: 10, 
    //fontSize: 15
  },
  flatlistItemImageBackground :{ // お知らせボタン ⇒ 通知設定 背景
    flex: 1, 
    width: '100@s', 
    height: '100@vs', 
    marginLeft: '8@ms', 
    marginTop: 8, 
    borderRadius: 20, 
    overflow: "hidden" 
  },
  flatlistItemView : {
    justifyContent: "flex-start", 
    alignItems: "center", 
    height: '100@s', 
    //ackgroundColor :'green',
  },
  flatlistItemImage :{   // お知らせボタン ⇒ 通知設定　写真のサイズ
    width: '50@s', 
    height: '50@vs',
    //backgroundColor : 'red',
  },
  flatlistItemText : {
    textAlign: "center", 
    marginTop: 0,
    fontSize : 15,
    //backgroundColor : 'blue'
  },

  // バッジ
  iconBadgeStyle : {
    top: '5@ms', 
    right: '-5@ms', 
    width: '30@s', 
    height: '30@vs', 
    backgroundColor: "#FF0000"
  },

  // Appバージョン情報
  appVersionText : {
    marginLeft: '10@ms', 
    marginBottom: '5@ms',
    fontSize : '15@s', // バージョン情報　文字 Font-size
  }

});
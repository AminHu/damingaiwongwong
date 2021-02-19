/*
 * モジュール名 : 言語選択コンポーネント(初期起動)
 * 作成日 ：2020/11/20
 * 作成者 : NEC
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */
import React, { Component } from 'react';
import { Image, StatusBar, } from 'react-native';
import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Icon, List, ListItem, Text, Badge, Tab, Tabs } from 'native-base';
import styles from '../common/style';
import CommonHeader from '../common/commonHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import i18n from 'i18n-js';
import {GetBackendLanguage} from './../common/utils'

//コンポーネントの内容を定義
export default class LanguageSettingScreen extends Component {
  constructor() {
    super()
    this.state = {
      langList: [
        { id: 1, name: "日本語", code: "ja", header: true, icon: require("../../assets/image/nationalflagsmall/Japan.jpg") },
        { id: 2, name: "English", code: "en", header: true, icon: require("../../assets/image/nationalflagsmall/Britain.jpg") },
        { id: 3, name: "Tiếng Việt", code: "vi", header: true, icon: require("../../assets/image/nationalflagsmall/Vietnam.jpg") },
        { id: 4, name: "中文", code: "zh", header: true, icon: require("../../assets/image/nationalflagsmall/China.jpg") },
        { id: 5, name: "Pilipino", code: "ph", header: true, icon: require("../../assets/image/nationalflagsmall/Philippines.jpg") },
        { id: 6, name: "bahasa Indonesia", code: "id", header: true, icon: require("../../assets/image/nationalflagsmall/Indonesia.jpg") },
        { id: 7, name: "ทย", code: "th", header: true, icon: require("../../assets/image/nationalflagsmall/Thailand.jpg") },
        { id: 8, name: "ជនជាតិខ្មែរ", code: "km", header: true, icon: require("../../assets/image/nationalflagsmall/Cambodia.jpg") },
        { id: 9, name: "မြန်မာ", code: "my", header: true, icon: require("../../assets/image/nationalflagsmall/Myanmar.jpg") },
        { id: 10, name: "Монгол", code: "mn", header: true, icon: require("../../assets/image/nationalflagsmall/Mongolia.jpg") },
      ],
      screenId: 'HBA-0810',
      isPressId: 1, // デフォルトの場合、日本語が選択されるようにする
      currentLang : i18n.locale,
      lang: "ja",
    };
  }

  // [*] イベント処理:言語選択
  handleItemClick(value, id) {
    //this.saveLangData(value);
    console.log("言語選択コンポーネント(初期起動) -> 選択言語:" + value);
    i18n.locale = value;
    // 背景色を変更
    this.setState({lang: value, isPressId: id });

    // タイトルを設定する お知らせ一覧
    const { setOptions } = this.props.navigation;
    setOptions({ title: i18n.t('HBA-0000-btnLangSetting') });

    //this.props.navigation.navigate("FirstStartPolicyScreen");　//
  }

  // [*] イベント処理:保存
  handleSaveClick = (value) => {
    //言語設定保存
    this.saveLangData(value);
  }

  // 言語設定保存
  saveLangData = async (value) => {
    try {
      // サーバーでトピックを解除する
      const currentLang = await GetBackendLanguage(this.state.currentLang);

      // 現在のお知らせとアンケートのトピックの購読をキャンセルする 20210205 mod by oushibu
      const currentNotice = "notice-" + currentLang;
      const currentQuestionnaire = "questionnaire-" + currentLang;

      messaging()
        .unsubscribeFromTopic(currentNotice)         // 20210205 mod by oushibu
        .then(() => console.log('Unsubscribed fom the topic : ', currentNotice));

      messaging()
        .unsubscribeFromTopic(currentQuestionnaire)  // 20210205 mod by oushibu
        .then(() => console.log('Unsubscribed fom the topic : ', currentQuestionnaire));

      // サーバーでトピックを登録する
      const newLanguage = await GetBackendLanguage(value);
      //console.log("Back-End Language : ",newLanguage);

      // 新しいのお知らせとアンケートのトピックの購読する 20210205 mod by oushibu
      const newNotice = "notice-" + newLanguage;
      const newQuestionnaire = "questionnaire-" + newLanguage;

      messaging()
        .subscribeToTopic(newNotice)                // 20210205 mod by oushibu
        .then(() => console.log('Subscribed to topic : ', newNotice));

      messaging()
        .subscribeToTopic(newQuestionnaire)         // 20210205 mod by oushibu
        .then(() => console.log('Subscribed to topic : ', newQuestionnaire));

      // 新言語を保存する
      await AsyncStorage.setItem('lang', value);

      // 通知設定画面で連動処理FLG
      await AsyncStorage.setItem('NoticeSettingLanuageChanged', 'Yes');
      
      this.props.navigation.navigate('FirstStartPolicyScreen');
    } catch (error) {
      console.log(error);
    }
  }

  //[*]コンポーネントのマウント
  async componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', async () => {

      // 現在の言語を選択する
      const currentLang = await AsyncStorage.getItem('lang');
      if (currentLang != null) {
        console.log("初回起動componentDidMount->currentLang : ",currentLang);
        (currentLang == "ja") && this.setState({isPressId : 1,currentLang : currentLang});
        (currentLang == "en") && this.setState({isPressId : 2,currentLang : currentLang});
        (currentLang == "vi") && this.setState({isPressId : 3,currentLang : currentLang});
        (currentLang == "zh") && this.setState({isPressId : 4,currentLang : currentLang});
        (currentLang == "ph") && this.setState({isPressId : 5,currentLang : currentLang});
        (currentLang == "id") && this.setState({isPressId : 6,currentLang : currentLang});
        (currentLang == "th") && this.setState({isPressId : 7,currentLang : currentLang});
        (currentLang == "km") && this.setState({isPressId : 8,currentLang : currentLang});
        (currentLang == "my") && this.setState({isPressId : 9,currentLang : currentLang});
        (currentLang == "mn") && this.setState({isPressId : 10,currentLang : currentLang});
      }
      else {
        console.log("初回起動componentDidMount->currentLang(null) : ",currentLang);
        this.setState({isPressId : 1,currentLang : 'ja'});
      }

    });
  }

  //[*]コンポーネントのアンマウント
  async componentWillUnmount() {
    this._unsubscribe();
  }  

  //表示する要素を返す
  render() {
    return (
      <Container>
        {/* <Header /> */}
        <Header style={{ backgroundColor: "#fff" }} noShadow>
          <Right>
            <Button rounded small iconLeft info onPress={() => {
              this.handleSaveClick(this.state.lang);
            }}>
              <Icon type="AntDesign" name='save' />
              <Text style={styles.buttonTextStyle}>{i18n.t('HBA-0800-btnSave')}</Text>
            </Button>
          </Right>
        </Header>
        <Content>
          <List>
            {this.state.langList.map((item, index) => {
              return (
                <ListItem noIndent key={index} onPress={() => this.handleItemClick(item.code, item.id)}
                  style={{ backgroundColor: this.state.isPressId == item.id ? "#b3ecff" : "#ffffff" }}
                >
                  <Image style={styles.iconImage} source={item.icon} />
                  <Body style={styles.body}>
                    <Text style={styles.itemName}>{item.name}</Text>
                  </Body>
                </ListItem>
              );
            })}
          </List>
        </Content>
      </Container>
    );
  }
}
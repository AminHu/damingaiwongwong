/*
 * モジュール名 : 言語設定コンポーネント(手動設定)
 * 作成日 ：2020/11/20
 * 作成者 : NEC
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */
import React, { Component } from 'react';
import { Container, Header, Content,Button, Right, Body, Icon, List, ListItem, Text} from 'native-base';
import { Image } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import styles from '../common/style';
import i18n from 'i18n-js';
import {GetBackendLanguage} from './../common/utils'

//コンポーネントの内容を定義
export default class LanguagesScreen extends Component {
  // 使用言語リスト
  constructor(props) {
    super(props);
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
      pressed: true,
      lang: "ja",
      buttonDisabled: true,
      screenId: 'HBA-0800',
      isPressId: '',
      currentLang : i18n.locale,
      saveBtnText: '保存'
    };
  }

  //[*]コンポーネントのマウント
  async componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', async () => {
      // タイトルを設定する 言語設定
      const { setOptions } = this.props.navigation;
      setOptions({ title: i18n.t('HBA-0000-btnLangSetting') });

      // 現在の言語を選択する
      const currentLang = await AsyncStorage.getItem('lang');
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
      
      (currentLang == "ja") && this.handleItemClick(currentLang, 1);
      (currentLang == "en") && this.handleItemClick(currentLang, 2);
      (currentLang == "vi") && this.handleItemClick(currentLang, 3);
      (currentLang == "zh") && this.handleItemClick(currentLang, 4);
      (currentLang == "ph") && this.handleItemClick(currentLang, 5);
      (currentLang == "id") && this.handleItemClick(currentLang, 6);
      (currentLang == "th") && this.handleItemClick(currentLang, 7);
      (currentLang == "km") && this.handleItemClick(currentLang, 8);
      (currentLang == "my") && this.handleItemClick(currentLang, 9);
      (currentLang == "mn") && this.handleItemClick(currentLang, 10);
    });
  }

  //[*]コンポーネントのアンマウント
  async componentWillUnmount() {
    this._unsubscribe();
  }

  // 言語設定保存
  saveLangData = async (value) => {
    try {
      // 言語切り替えすれば、お知らせとアンケートのバッジをクリアする
      if (this.state.currentLang != value) {
        await AsyncStorage.setItem('LanguageIsChanged','Yes');
/*        
        // お知らせは明細画面になった場合、自動でお知らせ一覧に戻るため、以下のフラグを設定する。
        await AsyncStorage.setItem('LanguageIsChangedForNotice','Yes');
        await AsyncStorage.setItem('LanguageIsChangedForDisaster','Yes');        // For 災害情報
        await AsyncStorage.setItem('LanguageIsChangedForOffice','Yes');          // For 事務所一覧
*/
      }

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
      //console.log("Back-End Language : ",backendLanguage);

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
      this.props.navigation.navigate('HomeScreen');
    } catch (error) {
      console.log(error);
    }
  }

  //言語設定取得
  getLangData = async () => {
    try {
      const value = await AsyncStorage.getItem('lang');
      if (value !== null) {
        console.log("保存言語:" + value);
      } else {
        console.log('no select language');
      }
    } catch (error) {
      console.log(error);
    }
  }

  // [*] イベント処理:言語選択
  handleItemClick(item, id) {
    console.log("選択言語:" + item);
    // ボタンの言語を切替する
    // i18n.locale = item;
    switch (item) {
      case "ja":
        this.setState({saveBtnText: '保存'})
        break;
      case "en":
        this.setState({saveBtnText: 'Save'})
        break;
      case "vi":
        this.setState({saveBtnText: 'Lưu'})
        break;
      case "zh":
        this.setState({saveBtnText: '保存'})
        break;
      case "ph":
        this.setState({saveBtnText: 'Save'})
        break;
      case "id":
        this.setState({saveBtnText: 'Simpan'})
        break;
      case "th":
        this.setState({saveBtnText: 'เซฟ'})
        break;
      case "km":
        this.setState({saveBtnText: 'រក្សាទុក'})
        break;
      case "my":
        this.setState({saveBtnText: 'သိမ်းရန်'})
        break;
      case "mn":
        this.setState({saveBtnText: 'Хад'})
        break;
    
      default:
        break;
    }

    // 背景色を変更 、ボタン制御
    if (this.state.currentLang == item) {
      this.setState({ buttonDisabled: true,lang: item,isPressId: id});
    }
    else {
      this.setState({ buttonDisabled: false,lang: item,isPressId: id});
    }
  }

  // [*] イベント処理:保存
  handleSaveClick = (value) => {
    //言語設定保存
    this.saveLangData(value);

    // ボタンの状態を「Disabled」にする
    this.setState({ buttonDisabled: true });
  }

  //表示する要素を返す
  render() {
    return (
      <Container>
        {/* <Header /> */}
        <Header style={{ backgroundColor: "#fff" }} noShadow>
          <Right>
            <Button rounded small iconLeft info disabled={(this.state.buttonDisabled) ? true : false} onPress={() => {
              this.handleSaveClick(this.state.lang);
            }}>
              <Icon type="AntDesign" name='save' />
              <Text style={styles.buttonTextStyle}>{this.state.saveBtnText}</Text>
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

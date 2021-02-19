/*
 * モジュール名 : 通知設定コンポーネント
 * 作成日 ：2020/11/20
 * 作成者 : NEC
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */
import React, { Component } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Container, Content, Button, ListItem, Text, Icon, Body, Left, Right, Switch, Picker, Input, Footer, FooterTab, Header } from 'native-base';
import NetInfo from "@react-native-community/netinfo";
import i18n from 'i18n-js';
import { isEmpty } from './../common/utils';
import styles from '../common/style';
import { getDataMunicipality, setDataPushNotice, getPushNoticeTest } from './app_setting';
import Dialog from "react-native-dialog";
import { Alert } from 'react-native';

//コンポーネントの内容を定義
export default class NoticeSetScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      screenId: 'HBA-0900',
      currentLang: i18n.locale,  // App言語
      noticeLang: '',            // 災害通知言語
      municipality: [],//地点コード
      pointName1: '', //地点名称１
      pointName2: '', //地点名称２
      pointName3: '', //地点名称３
      pointName4: '', //地点名称４
      pointName5: '', //地点名称５
      currentRow: '', //選択地点
      colorFalseSwitchIsOn: "",     //災害通知設定スイッチ
      buttonDisabled: true,         //保存ボタン活性・非活性フラグ
      isShowPushDialog: false,      //PUSH通知保存ダイアログ表示フラグ
      isShowDelDialog: false,       //削除ダイアログ表示フラグ
      isShowErrDialog: false,       //エラーダイアログ表示フラグ
      errMessage: '',
    };
  }

  // [*] イベント処理:画面遷移
  handleItemClick(point, value) {
    //災害通知設定スイッチONの場合
    if (this.state.colorFalseSwitchIsOn == "true") {
      if (isEmpty(value)) {
        //通知地点選択画面に遷移
        this.props.navigation.navigate('Prefectures', { point: point, noticeLang: this.state.noticeLang });
      } else {
        //選択削除地点
        this.setState({ currentRow: point });
        //削除確認
        this.showDelDialog(value);
      }
    }
  }

  // [*] イベント処理:災害通知設定(Switch Button)
  handleNoticeChange(value) {
    this.setState({
      colorFalseSwitchIsOn: value.toString()
    });

    // 保存ボタン 活性化 
    this.setState({ buttonDisabled: false });
  }

  // [*] イベント処理:通知言語設定
  handleLangChange(value, buttonControle) {
    console.log("handleLangChange 選択された言語 : ", value);
    //console.log("this.state.municipality : ",this.state.municipality);

    const pointItems = this.state.municipality;
    pointItems.map((item) => {
      //通知地点名称取得
      getDataMunicipality(value, item) // storeNoticeLang
        .then((res) => {
          //通知地点設定
          item.point === "1" && this.setState({ pointName1: res });
          item.point === "2" && this.setState({ pointName2: res });
          item.point === "3" && this.setState({ pointName3: res });
          item.point === "4" && this.setState({ pointName4: res });
          item.point === "5" && this.setState({ pointName5: res });
        })
        .catch((error) => this.showErrDialog(error, i18n.t('HBA-0900-digConnErr')));
    });

    // 災害通知言語と保存ボタンのStateを更新する
    this.setState({ noticeLang: value });

    if (buttonControle != "No") {
      this.setState({
        buttonDisabled: !value 　//ボタン活性化
      });
    }
  }

  // 災害通知設定保存(Switch Button)
  setStorageNoticeSetting = async (noticeSwitchOnOff) => {
    try {
      await AsyncStorage.setItem('noticeSwitch', noticeSwitchOnOff.toString());
    } catch (error) {
      console.log(error);
    }
  }

  // 通知言語設定保存
  setStorageLangSetting = async (noticeLang) => {
    try {
      await AsyncStorage.setItem('noticeLang', noticeLang);
    } catch (error) {
      console.log(error);
    }
  }

  // 通知地点保存
  setStoragePointSetting = async (noticePoint) => {
    try {
      await AsyncStorage.setItem('noticePoint', JSON.stringify(noticePoint));
    } catch (error) {
      console.log(error);
    }
  }

  // [*] イベント処理:保存
  async handleSaveClick() {
    try {
      // 災害通知設定保存
      await this.setStorageNoticeSetting(this.state.colorFalseSwitchIsOn);
      // 通知言語設定保存
      await this.setStorageLangSetting(this.state.noticeLang);
      // 通知地点保存
      await this.setStoragePointSetting(this.state.municipality);

      // ＝＝災害通知設定ON＝＝
      if (this.state.colorFalseSwitchIsOn == "true") {

        // 初回起動ではない場合、
        const sFirst = await AsyncStorage.getItem('FirstStart');
        if (sFirst === "false") {
          // 地点保存
          this.handleYes();
        }
        else {
          //プッシュ通知
          this.showPushDialog();
        }

      } else {
        // ＝＝災害通知設定OFF＝＝
        this.state.municipality.map((item) => {
          //PUSH通知有無 0：プッシュしない　1：プッシュする
          setDataPushNotice(this.state.noticeLang, 0, item)
        });

        // 災害通知送信しない場合、地点情報を削除しない
        /*
        this.props.route.params = [];
        this.setState({ municipality: [], pointName1: '', pointName2: '', pointName3: '', pointName4: '', pointName5: '' });
        this.removeItemValue('noticePoint');
        */

        // 次の画面に遷移する
        this.goToNexScreen();
      }

    } catch (error) {
      this.showErrDialog(error, i18n.t('HBA-0900-digSaveErr'))
    }
    //保存ボタン非活性化
    this.setState({ buttonDisabled: true });
  }

  // 保存した後、次の画面に遷移する
  async goToNexScreen() {
    //起動状態取得
    const isFirstStart = await AsyncStorage.getItem('FirstStart');
    //初回起動ではない場合
    if (isFirstStart !== null && isFirstStart == "false") {
      //TOPメニューに遷移
      this.props.navigation.navigate("HomeScreen");
    }
    else {
      // 初回起動用プッシュ通知設定画面へ遷移
      this.props.navigation.navigate("PermissionAndroidViewScreen");
    }
  }

  //[*]プッシュ通知ダイアログ表示
  showPushDialog() {
    //表示切替
    this.setState({ isShowPushDialog: !this.state.isShowPushDialog })
  }

  //[*]プッシュ通知確認ダイアログ（いいえ）
  handleNo() {
    // プッシュ通知しない
    this.state.municipality.map((item) => {
      //PUSH通知有無 0：プッシュしない　1：プッシュする
      setDataPushNotice(this.state.noticeLang, 0, item)
    });
    this.setState({ isShowPushDialog: !this.state.isShowPushDialog });

    // 次の画面に遷移する
    this.goToNexScreen();
  }

  //[*]プッシュ通知確認ダイアログ（はい）
  handleYes() {
    // プッシュ通知する
    this.state.municipality.map((item) => {
      //PUSH通知有無 0：プッシュしない　1：プッシュする
      setDataPushNotice(this.state.noticeLang, 1, item)
    });
    
    // 一度表示した後「false」に設定する
    this.setState({ isShowPushDialog: false });
    //this.setState({ isShowPushDialog: !this.state.isShowPushDialog });

    // 次の画面に遷移する
    this.goToNexScreen();
  }


  //[*]削除確認ダイアログ表示
  showDelDialog(pointName) {
    //表示切替
    //this.setState({ isShowDelDialog: !this.state.isShowDelDialog });
    //この地点（地点名）を削除してもよろしいですか?",
    sDeleteMessage = i18n.t('HBA-0900-msgPintDelConfirm').replace("$POINT_NAME",pointName)

    // 削除用の確認メッセージを表示する
    Alert.alert(
      i18n.t('HBA-0900-noticeSetting'),     // Title
      sDeleteMessage, // Description
      [
        { text: i18n.t('HBA-0900-btnYes'), onPress: () => { this.handleOK() } }, // OK ボタン console.log("OK Pressed");
        {
          text: i18n.t('HBA-0900-btnNo'),   // Cancel ボタン
          onPress: () => { },                // console.log("Cancel Pressed");
          style: "cancel"
        }
      ],
      { cancelable: false }
    );

  }

  //[*]削除確認ダイアログ（はい）
  handleOK() {
    /*
        console.log("this.state.pointName1A : ",this.state.pointName1);
        console.log("this.state.pointName2A : ",this.state.pointName2);
        console.log("this.state.pointName3A : ",this.state.pointName3);
        console.log("this.state.pointName4A : ",this.state.pointName4);
        console.log("this.state.pointName5A : ",this.state.pointName5);
        console.log("this.state.municipalityA : ",this.state.municipality);
    */
    //選択地点削除
    const selectedPoint = this.state.currentRow;
    var municipality = this.state.municipality;
    municipality.some(function (val, i) {
      if (val.point == selectedPoint) {
        municipality.splice(i, 1)
      };
    });

    //通知地点名称クリア
    selectedPoint === "1" && this.setState({ pointName1: '' });
    selectedPoint === "2" && this.setState({ pointName2: '' });
    selectedPoint === "3" && this.setState({ pointName3: '' });
    selectedPoint === "4" && this.setState({ pointName4: '' });
    selectedPoint === "5" && this.setState({ pointName5: '' });

    //表示切替、保存ボタン活性化
    this.setState({ isShowDelDialog: !this.state.isShowDelDialog, buttonDisabled: false, municipality: municipality });
    /*
        console.log("this.state.pointName1B : ",this.state.pointName1);
        console.log("this.state.pointName2B : ",this.state.pointName2);
        console.log("this.state.pointName3B : ",this.state.pointName3);
        console.log("this.state.pointName4B : ",this.state.pointName4);
        console.log("this.state.pointName5B : ",this.state.pointName5);
        console.log("this.state.municipalityB : ",this.state.municipality);
    */
  }

  //[*]削除確認ダイアログ（いいえ）
  handleCancel() {
    //表示切替
    this.setState({ isShowDelDialog: !this.state.isShowDelDialog });
  }

  //[*]エラーダイアログ表示
  showErrDialog(error, message) {
    console.log(error);
    this.setState({ isShowErrDialog: true });
    this.setState({ errMessage: message });
  }
  handleError() {
    // 次の画面に遷移する
    this.goToNexScreen();
  }

  //[*]保存設定削除
  async removeItemValue(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    }
    catch (exception) {
      return false;
    }
  }

  async _pointSelected() {
    //通知地点選択表示
    let pointPara = this.state.municipality;
    //console.log("pointPara : ",pointPara);
    //console.log("this.props.route.params : ",this.props.route.params);

    if (!isEmpty(this.props.route.params)) {
      //地点コード
      const point = this.props.route.params.point;

      //通知地点格納
      let municipality = pointPara.filter(target => {
        return target.point == point;
      });

      if (isEmpty(municipality)) {
        let currentPoint = this.state.municipality;   //現在通知地点
        let selectedPoint = this.props.route.params;  //選択通知地点

        let newFlg = true;
        for (let item in currentPoint) {
          //同一通知地点名が存在
          if ((currentPoint[item].region_code === selectedPoint.region_code) &&
            (currentPoint[item].prefecture_code === selectedPoint.prefecture_code) &&
            (currentPoint[item].city_code === selectedPoint.city_code) &&
            (currentPoint[item].village_code === selectedPoint.village_code)) {
            newFlg = false; //地点リストに追加しない
            this.props.route.params = "";
            break;
          }
        }
        //新規の通知地点格納
        newFlg && this.state.municipality.push(this.props.route.params);
        // 保存ボタン 活性化 
        this.setState({ buttonDisabled: false });
      }

      if (!isEmpty(this.props.route.params)) {
        //通知地点名称取得
        getDataMunicipality(this.state.noticeLang, this.props.route.params)
          .then((res) => {
            //通知地点設定
            point === "1" && this.setState({ pointName1: res });
            point === "2" && this.setState({ pointName2: res });
            point === "3" && this.setState({ pointName3: res });
            point === "4" && this.setState({ pointName4: res });
            point === "5" && this.setState({ pointName5: res });
          })
          .catch((error) => this.showErrDialog(error, i18n.t('HBA-0900-digConnErr')));

        // 地点選択画面からのパラメータを利用した後、すべての内容をクリアする
        this.props.route.params = null;
      }

      if (!isEmpty(pointPara)) {
        this.setState({ municipality: pointPara });
      }
    }
  }

  //[*]コンポーネントのマウント
  async componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', async () => {
      // 画面内多言語対応
      const langValue = await AsyncStorage.getItem('lang');
      i18n.locale = langValue;
      this.setState({ currentLang: i18n.locale });

      // 初回起動の場合、災害通知言語はＡＰＰ言語と連動する
      const sFirst = await AsyncStorage.getItem('FirstStart');

      // 通知設定画面で連動処理FLG,災害通知言語はＡＰＰ言語と連動する
      let sNoticeSettingLanuageChanged = await AsyncStorage.getItem('NoticeSettingLanuageChanged');
      console.log("初回起動フラグ -->  FirstStart 1111: ", sFirst,", 本画面で言語切替があるか ： ",sNoticeSettingLanuageChanged);
      if (sNoticeSettingLanuageChanged == null) {
        sNoticeSettingLanuageChanged = "No";
      }
      
      console.log("初回起動フラグ -->  FirstStart 2222: ", sFirst,", 本画面で言語切替があるか ： ",sNoticeSettingLanuageChanged);

      if (sNoticeSettingLanuageChanged == "Yes") {     // if (sFirst == "true") {  
        // 言語切り替えフラグを「No」に設定する
        await AsyncStorage.setItem('NoticeSettingLanuageChanged', 'No');
        
        if (langValue == "ja") {
          this.setState({ noticeLang: "ja",colorFalseSwitchIsOn : "true" ,buttonDisabled :false});
        }
        else if (langValue == "zh") {
          this.setState({ noticeLang: "zhs",colorFalseSwitchIsOn : "true" ,buttonDisabled :false});
        }
        else {
          this.setState({ noticeLang: "en",colorFalseSwitchIsOn : "true" ,buttonDisabled :false});
        }

        this.handleLangChange(this.state.noticeLang, "No");
      }

      // タイトルを設定する 通知設定
      const { setOptions } = this.props.navigation;
      setOptions({ title: i18n.t('HBA-0000-btnNoticeSetting') });

      const sMoveMoto = await AsyncStorage.getItem('MoveMoto');
      console.log("MoveMoto :  ****************************** : ", sMoveMoto);

      // インターネットが接続されているかチェックする
      NetInfo.fetch().then(async state => {
        if (state.isConnected) {
          // メニューから画面に入る時、前回保存されている内容を表示する。
          if (sMoveMoto !== null && (sMoveMoto == "top" || sMoveMoto == "side_menu")) {
            console.log("通知設定->前回保存した内容を表示する");
            await AsyncStorage.setItem('MoveMoto', '');

            //保存設定値取得
            const storeNoticeSwitch = await AsyncStorage.getItem('noticeSwitch');
            const storeNoticeLang = await AsyncStorage.getItem('noticeLang');
            const storeNoticePoint = await AsyncStorage.getItem('noticePoint');

            //console.log("保存設定値取得 storeNoticeSwitch: ",storeNoticeSwitch);
            //console.log("保存設定値取得 storeNoticeLang: ",storeNoticeLang);
            //console.log("保存設定値取得 storeNoticePoint: ",storeNoticePoint);

            //通知設定初期値
            if (storeNoticeSwitch == null) {
              this.setState({ colorFalseSwitchIsOn: false });
            } else {
              this.setState({ colorFalseSwitchIsOn: storeNoticeSwitch });
            }

            //通知言語初期値
            if (storeNoticeLang == null) {
              this.setState({ noticeLang: 'ja' });
            } else {
              this.setState({ noticeLang: storeNoticeLang });
            }

            //通知地点初期表示
            if (!isEmpty(storeNoticePoint)) {
              let pointItems = [];
              pointItems = JSON.parse(storeNoticePoint);

              // 現在の地点の内容をすべてクリアする
              this.setState({ pointName1: '', pointName2: '', pointName3: '', pointName4: '', pointName5: '' });

              pointItems.map((item) => {
                //通知地点名称取得
                getDataMunicipality(storeNoticeLang, item)
                  .then((res) => {
                    //通知地点設定
                    item.point === "1" && this.setState({ pointName1: res });
                    item.point === "2" && this.setState({ pointName2: res });
                    item.point === "3" && this.setState({ pointName3: res });
                    item.point === "4" && this.setState({ pointName4: res });
                    item.point === "5" && this.setState({ pointName5: res });
                  })
                  .catch((error) => this.showErrDialog(error, i18n.t('HBA-0900-digConnErr')));
              });

              this.setState({ municipality: pointItems });
              // 保存ボタン 非活性化 
              this.setState({ buttonDisabled: true });
            }

          }
          else {
            // 地点選択画面からこの画面遷移する時
            console.log("通知設定->地点選択画面から遷移する。");
            await this._pointSelected();
          }
        }
        else {
          // 通知地点情報を取得できませんでした。
          this.showErrDialog("", i18n.t('HBA-0900-digConnErr'));
        }

      });

    });
  }

  //[*]コンポーネントのアンマウント
  componentWillUnmount() {
    this._unsubscribe();
  }

  //PUSH通知受信テスト用（リリース時は削除すること）
  handlePushTestClick() {
    const type = "earthquake"; //earthquake：緊急地震速報PUSH　weather：気象特別警報PUSH tsunami：津波速報PUSH　eruption：噴火速報PUSH　heatillness：熱中症PUSH
    //const lat = "37.4";
    //const lon = "140.9";
    const lat = "36.8";
    const lon = "139.6";

    getPushNoticeTest(type, lat, lon)
      .then((res) => {
        Alert.alert("送信に成功したPUSHの数:" + res.success, "送信に失敗したPUSHの数" + res.failure);
      })
  }

  //表示する要素を返す
  render() {
    return (
      <Container>
        {/* <Header /> */}
        <Header style={{ backgroundColor: "#fff" }} noShadow>

          <Left>
            <Button full onPress={() => {
              this.handlePushTestClick();
            }}>
              <Text style={styles.buttonTextStyle}>Pushテスト</Text>
            </Button>
          </Left>

          <Right>
            <Button rounded small iconLeft info disabled={(this.state.buttonDisabled) ? true : false} onPress={() => {
              this.handleSaveClick();
            }}>
              <Icon type="AntDesign" name='save' />
              <Text style={styles.buttonTextStyle}>{i18n.t('HBA-0800-btnSave')}</Text>
            </Button>
          </Right>
        </Header>
        <Content>
          <ListItem style={{marginBottom:10}}  icon>
            <Body>
              {/* 災害通知設定*/}
              <Text>{i18n.t('HBA-0900-noticeSetting')}</Text>
            </Body>
            <Right>
              <Switch
                trackColor={{ true: 'green', false: 'grey' }}
                value={(this.state.colorFalseSwitchIsOn == "true") ? true : false}
                onValueChange={this.handleNoticeChange.bind(this)}
              />
            </Right>
          </ListItem>

          <ListItem style={{marginBottom:10}}  icon>
            <Body>
              {/* 災害言語設定*/}
              <Text>{i18n.t('HBA-0900-langSetting')}</Text>
            </Body>
            <Right style={{justifyContent:"center"}}>
              <Picker
                note
                mode="dropdown"
                iosIcon={<Icon name="arrow-down" />}
                enabled={(this.state.colorFalseSwitchIsOn == "true") ? true : false}
                selectedValue={this.state.noticeLang}
                onValueChange={this.handleLangChange.bind(this)}
                style={{ width: 130 }}
              >
                <Picker.Item label="日本語" value="ja" />
                <Picker.Item label="English" value="en" />
                <Picker.Item label="中文" value="zhs" />
              </Picker>
            </Right>
          </ListItem>

          <ListItem itemDivider style={{ marginTop: 60 }}>
            {/* 通知地点設定*/}
            <Text>{i18n.t('HBA-0900-pointSetting')}</Text>
          </ListItem>
          <ListItem icon>
            <Body>
              <Input
                style={{ color: "blue" }}
                placeholderTextColor="gray"
                placeholder={i18n.t('HBA-0900-point1')}
                editable={false}
                value={this.state.pointName1}
              />

            </Body>
            <Right>
              <Icon active
                name={this.state.pointName1 === "" ? "plus" : "minus"}
                type="Entypo"
                enabled={(this.state.colorFalseSwitchIsOn == "true") ? true : false}
                style={this.state.pointName1 === "" ?
                  ((this.state.colorFalseSwitchIsOn == "true") ? { fontSize: 30, color: 'red' } : { fontSize: 30, color: '#d1d1e1' }) :
                  ((this.state.colorFalseSwitchIsOn == "true") ? { fontSize: 30, color: 'green' } : { fontSize: 30, color: '#d1d1e1' })
                }
                onPress={() => this.handleItemClick("1", this.state.pointName1)} />
            </Right>
          </ListItem>

          <ListItem icon>
            <Body>
              <Input
                style={{ color: "blue" }}
                placeholderTextColor="gray"
                placeholder={i18n.t('HBA-0900-point2')}
                editable={false}
                value={this.state.pointName2}
              />
            </Body>
            <Right>
              <Icon active
                name={this.state.pointName2 === "" ? "plus" : "minus"}
                type="Entypo"
                style={this.state.pointName2 === "" ?
                  ((this.state.colorFalseSwitchIsOn == "true") ? { fontSize: 30, color: 'red' } : { fontSize: 30, color: '#d1d1e1' }) :
                  ((this.state.colorFalseSwitchIsOn == "true") ? { fontSize: 30, color: 'green' } : { fontSize: 30, color: '#d1d1e1' })
                }
                onPress={() => this.handleItemClick("2", this.state.pointName2)}
              />
            </Right>
          </ListItem>

          <ListItem icon>
            <Body>
              <Input
                style={{ color: "blue" }}
                placeholderTextColor="gray"
                placeholder={i18n.t('HBA-0900-point3')}
                editable={false}
                value={this.state.pointName3}
              />
            </Body>
            <Right>
              <Icon active
                name={this.state.pointName3 === "" ? "plus" : "minus"}
                type="Entypo"
                style={this.state.pointName3 === "" ?
                  ((this.state.colorFalseSwitchIsOn == "true") ? { fontSize: 30, color: 'red' } : { fontSize: 30, color: '#d1d1e1' }) :
                  ((this.state.colorFalseSwitchIsOn == "true") ? { fontSize: 30, color: 'green' } : { fontSize: 30, color: '#d1d1e1' })
                }
                onPress={() => this.handleItemClick("3", this.state.pointName3)} />
            </Right>
          </ListItem>

          <ListItem icon>
            <Body>
              <Input
                style={{ color: "blue" }}
                placeholderTextColor="gray"
                placeholder={i18n.t('HBA-0900-point4')}
                editable={false}
                value={this.state.pointName4}
              />
            </Body>
            <Right>
              <Icon active
                name={this.state.pointName4 === "" ? "plus" : "minus"}
                type="Entypo"
                style={this.state.pointName4 === "" ?
                  ((this.state.colorFalseSwitchIsOn == "true") ? { fontSize: 30, color: 'red' } : { fontSize: 30, color: '#d1d1e1' }) :
                  ((this.state.colorFalseSwitchIsOn == "true") ? { fontSize: 30, color: 'green' } : { fontSize: 30, color: '#d1d1e1' })
                }
                onPress={() => this.handleItemClick("4", this.state.pointName4)} />
            </Right>
          </ListItem>

          <ListItem icon>
            <Body>
              <Input
                style={{ color: "blue" }}
                placeholderTextColor="gray"
                placeholder={i18n.t('HBA-0900-point5')}
                editable={false}
                value={this.state.pointName5}
              />
            </Body>
            <Right>
              <Icon active
                name={this.state.pointName5 === "" ? "plus" : "minus"}
                type="Entypo"
                style={this.state.pointName5 === "" ?
                  ((this.state.colorFalseSwitchIsOn == "true") ? { fontSize: 30, color: 'red' } : { fontSize: 30, color: '#d1d1e1' }) :
                  ((this.state.colorFalseSwitchIsOn == "true") ? { fontSize: 30, color: 'green' } : { fontSize: 30, color: '#d1d1e1' })
                }
                onPress={() => this.handleItemClick("5", this.state.pointName5)} />
            </Right>
          </ListItem>
        </Content>
        <Dialog.Container visible={this.state.isShowPushDialog}>
          <Dialog.Title>{i18n.t('HBA-0900-noticeSetting')}</Dialog.Title>
          <Dialog.Description>{i18n.t('HBA-0000-msgPush')}</Dialog.Description>
          <Dialog.Button label={i18n.t('HBA-0900-btnYes')} bold={true} onPress={() => this.handleYes()} />
          <Dialog.Button label={i18n.t('HBA-0900-btnNo')} onPress={() => this.handleNo()} />
        </Dialog.Container>
        {/*
        <Dialog.Container visible={this.state.isShowDelDialog}>
          <Dialog.Title>{i18n.t('HBA-0900-noticeSetting')}</Dialog.Title>
          <Dialog.Description>{i18n.t('HBA-0900-msgPintDelConfirm')}</Dialog.Description>
          <Dialog.Button label={i18n.t('HBA-0900-btnYes')} bold={true} onPress={() => this.handleOK()} />
          <Dialog.Button label={i18n.t('HBA-0900-btnNo')} onPress={() => this.handleCancel()} />
        </Dialog.Container>
*/}
        <Dialog.Container visible={this.state.isShowErrDialog}>
          <Dialog.Title>{i18n.t('HBA-0900-noticeSetting')}</Dialog.Title>
          <Dialog.Description>{this.state.errMessage}</Dialog.Description>
          <Dialog.Button label="OK" bold={true} onPress={() => this.handleError()} />
        </Dialog.Container>
      </Container>
    );
  }
}

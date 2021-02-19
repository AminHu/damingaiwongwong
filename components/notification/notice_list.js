/*
* 画面名 : お知らせ一覧画面
* 作成日 ：2020/10/03
* 作成者 : NEC
* 修正日 :
* 修正者 :
* ver:1.0.0
*/
import React, { Component } from "react";
import { Container, Content, List, ListItem, Text, Body } from "native-base";
import NetInfo from "@react-native-community/netinfo";
import styles from '../common/style';
import { GetNoticeData } from './../common/database';
import Dialog from "react-native-dialog";
import i18n from 'i18n-js';
import { isEmpty } from '../common/utils';
import { ActivityIndicator } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

//コンポーネントの内容を定義
export default class NoticeScreen extends Component {
  constructor() {
    super()
    this.state = {
      screenId: 'HBA-0200',
      noticeDatas: [],
      isShowErrDialog: false,       //エラーダイアログ表示フラグ
      messageBody: '',
      isLoddng: true,
    };
  }

  //[*]コンポーネントのマウント
  async componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', async () => {
      // タイトルを設定する お知らせ一覧
      const { setOptions } = this.props.navigation;
      setOptions({ title: i18n.t('HBA-0200-noticeList') });

      // 遷移元を保存する
      await AsyncStorage.setItem('BlurFromNotice', 'Yes');

      //　詳細画面から別画面に遷移した後、自動でお知らせ一覧に戻る
      await AsyncStorage.setItem('AutoReturnForNotice', 'No');

      let sAction = "";
      // 通知明細画面 -> 通知一覧画面に遷移する場合、通知一覧画面が更新しない
      if (!isEmpty(this.props.route.params)) {
        console.log("this.props.route.params : ", this.props.route.params);
        // 画面動作
        //const {Action} = this.props.route.params;
        sAction = this.props.route.params.Action;
        this.props.route.params = null;
      }

      // インターネットが接続されているかチェックする
      NetInfo.fetch().then(async state => {
        if (state.isConnected) {

          // 詳細画面から一覧画面に戻る時、一覧画面の内容は再取得しない。
          if (sAction != "ReturnNoticeList") {
            // お知らせデータを取得する
            const result = await GetNoticeData();
            if (result.success) {
              if (!isEmpty(result.data)) {
                this.setState({ noticeDatas: result.data });
              } else {
                this.setState({ noticeDatas: [] });
              }
              //データ取得完了
              this.setState({ isLoddng: false });
            }
            else {
              //エラーダイアログ表示
              this.showErrDialog(i18n.t('HBA-0200-digConnErr'));
            }
          }

        }
        else {
          this.setState({ noticeDatas: [] });
          //エラーダイアログ表示
          this.showErrDialog(i18n.t('HBA-0200-digConnErr'));
        }
      });

    });
  }

  //[*]コンポーネントのアンマウント
  async componentWillUnmount() {
    this._unsubscribe();
  }

  //[*]エラーダイアログ表示
  showErrDialog(message) {
    this.setState({ isShowErrDialog: true });
    this.setState({ messageBody: message });
  }
  handleError() {
    //TOPメニューに遷移
    this.props.navigation.navigate("HomeScreen");
    this.setState({ isShowErrDialog: false });
  }

  // [*] イベント処理:詳細
  handleItemClick(value) {
    this.props.navigation.navigate("NoticeDetailScreen", { "value": value });
  };

  //表示する要素を返す
  render() {
    const { noticeDatas, isShowErrDialog, messageBody, isLoddng } = this.state;

    return (
      <Container>
        {isLoddng ? <ActivityIndicator /> : (
          <Content>
            {noticeDatas.length === 0 ?
              <Text style={styles.messageText}>{i18n.t('HBA-0200-msgNoNotice')}</Text>
              : (
                <List>
                  {noticeDatas.map((value, index) => {
                    return (
                      <ListItem avatar
                        key={index}
                        onPress={() => this.handleItemClick(value)}>
                        <Body style={styles.body}>
                          <Text style={styles.listItemKey}>{value.datetime}</Text>
                          <Text style={styles.listItemData}>{value.notice}</Text>
                        </Body>
                      </ListItem>
                    );
                  })}
                </List>
              )}
          </Content>
        )}
        <Dialog.Container visible={isShowErrDialog}>
          <Dialog.Title>{i18n.t('HBA-0200-noticeList')}</Dialog.Title>
          <Dialog.Description>{messageBody}</Dialog.Description>
          <Dialog.Button label="OK" bold={true} onPress={() => this.handleError()} />
        </Dialog.Container>
      </Container>
    );
  }
}


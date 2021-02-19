
/*
 * モジュール名 : アンケート一覧コンポーネント
 * 作成日 ：2020/12/03
 * 作成者 : NEC
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */
import React, { Component } from 'react';
import { Linking, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";
import { Container, Content } from "native-base";
import { List, ListItem, Text, Body } from 'native-base';
import styles from '../common/style';
import { GetQuestionaireData } from './../common/database'
import Dialog from "react-native-dialog";
import { isEmpty } from '../common/utils';
import i18n from 'i18n-js';

export default class QuestionnaireScreen extends Component {
  constructor() {
    super()
    this.state = {
      screenId: 'HBA-0500',
      questionDatas: [],
      isShowErrDialog: false,       //エラーダイアログ表示フラグ
      messageBody: '',
      isLoddng: true,
    };
  }

  //[*]コンポーネントのマウント
  async componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', async () => {
      // タイトルを設定する アンケート一覧
      const { setOptions } = this.props.navigation;
      setOptions({ title: i18n.t('HBA-0500-questionnaireList') });

      // 遷移元を保存する
      await AsyncStorage.setItem('BlurFromQuestionnaire', 'Yes');

      // インターネットが接続されているかチェックする
      NetInfo.fetch().then(async state => {
        if (state.isConnected) {
          // アンケートデータを取得する
          const result = await GetQuestionaireData();
          if (result.success) {
            if (!isEmpty(result.data)) {
              this.setState({ questionDatas: result.data });
            } else {
              this.setState({ questionDatas: [] });
            }
            //データ取得完了
            this.setState({ isLoddng: false });
          }
          else {
            //エラーダイアログ表示
            this.showErrDialog(i18n.t('HBA-0500-digConnErr'));
          }
        }
        else {
          this.setState({ questionDatas: [] });
          //エラーダイアログ表示
          this.showErrDialog(i18n.t('HBA-0500-digConnErr'));
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

  render() {
    const { questionDatas, isShowErrDialog, messageBody, isLoddng } = this.state;

    return (
      <Container>
        {isLoddng ? <ActivityIndicator /> : (
          <Content>
            {questionDatas.length === 0 ?
              <Text style={styles.messageText}>{i18n.t('HBA-0500-msgNoQuestionary')}</Text>
              : (
                <List>
                  {questionDatas.map((value, index) => {
                    return (
                      <ListItem avatar style={{ margin: 0 }} key={index}>
                        <TouchableOpacity style={{ flex: 1 }}
                          onPress={() => Linking.openURL(value.url)}
                        >
                          <Body style={{ marginLeft: 0 }}>
                            <Text style={{ fontSize: 12 }}>{value.datetime}</Text>
                            <Text style={{ fontSize: 14 }}>{value.detail}</Text>
                          </Body>
                        </TouchableOpacity>
                      </ListItem>
                    );
                  })}
                </List>
              )}
          </Content>
        )}
        <Dialog.Container visible={isShowErrDialog}>
          <Dialog.Title>{i18n.t('HBA-0500-questionnaireList')}</Dialog.Title>
          <Dialog.Description>{messageBody}</Dialog.Description>
          <Dialog.Button label="OK" bold={true} onPress={() => this.handleError()} />
        </Dialog.Container>
      </Container>
    );
  }
}
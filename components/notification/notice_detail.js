/*
* 画面名 : お知らせ詳細画面
* 作成日 ：2020/10/04
* 作成者 : NEC
* 修正日 :
* 修正者 :
* ver:1.0.0
*/
import React, { Component } from 'react';
import { Linking } from 'react-native';
import { Container, Content, Card, Text, ListItem, List } from "native-base";
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../common/style';
import { ScrollView } from "react-native";
import Autolink from 'react-native-autolink';
import i18n from 'i18n-js';

//コンポーネントの内容を定義
export default class DetailsScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      screenId: 'HBA-0210',
    };
  }

  async componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', async () => {
      // 詳細画面から別画面に遷移した後、自動でお知らせ一覧に戻る
      const sAutoReturnForNotice =  await AsyncStorage.getItem('AutoReturnForNotice');

      if (sAutoReturnForNotice !== null && sAutoReturnForNotice == "Yes") {
        //this.props.navigation.navigate("NoticeScreen");
        this.props.navigation.popToTop();
      }

      await AsyncStorage.setItem('AutoReturnForNotice','Yes');
    });
  }

  //[*]コンポーネントのアンマウント
  async componentWillUnmount() {
    this._unsubscribe();
  }

  //表示する要素を返す
  render() {
    // お知らせ一覧からのデータを取得する
    const { value } = this.props.route.params;

    return (
      <Container>
        <Content padder>
          <Card>
            <List>
              <ListItem itemDivider>
                <Text style={styles.bigTitle}>{i18n.t('HBA-0210-noticeTitle')}</Text>
              </ListItem>
              <ListItem style={styles.listViewCol}>
                <Text style={styles.titleText}>
                  {value.notice}
                </Text>
                <Text style={styles.titleEnd}>
                  {value.datetime}
                </Text>
              </ListItem>
            </List>
          </Card>

          <Card>
            <List>
              <ListItem itemDivider>
                <Text style={styles.bigTitle}>{i18n.t('HBA-0210-noticeContents')}</Text>
              </ListItem>
              <ListItem style={{ textAlign : 'left'}}>
                <ScrollView style={{ flex: 1 }}>
                  <Autolink style = {styles.listItemDetail}
                    text={value.detail}
                    onPress={(url, match) => {
                      Linking.openURL(url);
                    }}
                  />
                </ScrollView>
              </ListItem>
            </List>
          </Card>
        </Content>
      </Container>
    );
  }
}

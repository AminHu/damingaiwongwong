/*
 * モジュール名 : 災害情報詳細コンポーネント
 * 作成日 ：2020/11/20
 * 作成者 : NEC
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */
import React, { Component } from 'react';
import EarthquakeInfo from './earthquake_info.js';
import EruptionInfo from './eruption_info.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

//コンポーネントの内容を定義
export default class DisasterDetailScreen extends Component {
  constructor() {
    super()
    this.state = {
      screenId: 'HBA-0310',
    };
  }

  //[*] コンポーネントのマウント
  async componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', async () => {

      // 詳細画面から別画面に遷移した後、自動で災害一覧に戻る
      const sAutoReturnForDisaster =  await AsyncStorage.getItem('AutoReturnForDisaster');

      if (sAutoReturnForDisaster !== null && sAutoReturnForDisaster == "Yes") {
        //this.props.navigation.navigate("NoticeScreen");
        this.props.navigation.popToTop();
      }

      await AsyncStorage.setItem('AutoReturnForDisaster','Yes');
    });
  }

  //[*]コンポーネントのアンマウント
  async componentWillUnmount() {
    this._unsubscribe();
  }

  //表示する要素を返す
  render() {
    const {tab, code, noticeLang} = this.props.route.params;    
    if (tab == 1) {
      return (
        <EarthquakeInfo quakeCode ={ code } navigation ={this.props.navigation} lang ={noticeLang}/>
      );
    } else {
      return (
        <EruptionInfo volcanoCode ={ code } navigation ={this.props.navigation} lang ={noticeLang}/>
      );
    }
  }
}
import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

var { height, width } = Dimensions.get('window');
const styles = ScaledSheet.create(
    {
        base: {
            padding: 0,
            flex: 1,
        },
        body: {
            marginLeft: 0,
        },
        header: {
            color: '#fff',
            fontSize: 20,
        },
        footer: {
            color: '#fff',
            fontSize: 20,
        },
        title: {
            marginLeft: 15,
            marginRight: 15,
            marginBottom: 10,
        },
        titleView: {
            alignItems: 'center',
            justifyContent: "center"
        },

        // お知らせ一覧 -> 日付
        listItemKey: {
            fontSize: '12@s',  // 12
        },
        // お知らせ一覧 -> タイトル
        listItemData: {
            fontSize: '14@s',  // 14,
        },

        // お知らせ明細 -> Title
        bigTitle :{
            fontSize: '16@s',  // 16,
        },
        // お知らせ明細 -> タイトル 
        titleText: {
            marginLeft: 10,
            //textAlign: 'left',
            alignSelf: 'flex-start',
            fontSize: '18@ms',
            fontWeight: 'bold',
        },
        // お知らせ明細 -> 日付 
        titleEnd: {
            marginTop: 10,
            alignSelf: 'flex-end',
            fontSize: '14@ms',
        },
        // お知らせ明細 -> 明細内容
        listItemDetail: {
            fontSize: '14@s',  // 14,
        },

        listContainer: {
            height: '100%',
            backgroundColor: 'white',
        },
        listView: {
            flexDirection: "row",
            alignItems: 'center',
        },
        listViewRow: {
            flexDirection: "row",
        },
        listViewCol: {
            flexDirection: "column",
        },
        listItem: {
            padding: 10,
            fontSize: 18,
            height: 44,
            textDecorationLine: 'underline',
        },
        settingTitle: {
            backgroundColor: 'white',
            borderBottomWidth: 1,
        },
        settingView: {
            borderBottomWidth: 1,
        },
        settingItem: {
            padding: 10,
            fontSize: 18,
            height: 44,
        },
        container: {
            height: height,
            backgroundColor: 'white',
            padding: 10,
            width: width
        },
        detailItemTitle: {
            fontSize: 20,
            marginTop: 10,
            fontWeight: 'bold'
        },
        detailItem: {
            fontSize: 14,
            marginTop: 0,
        },
        postWrap: {
            marginTop: 25,
            marginLeft: 25,
            marginRight: 25,
            borderBottomWidth: 1,
            borderColor: '#ccc',
        },
        mapContainer: {
            flex: 1,
            margin: 5,
            alignItems: 'center',
            justifyContent: 'center',
        },
        buttonContainer: {
            padding: 10,
            margin: 20,
            textAlign: 'center',
        },
        buttonStyle: {
            margin: (5),
            alignItems: 'center',
        },

        // 言語設定画面 -> 保存ボタン
        buttonTextStyle: {
            fontSize: '13@s',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#fff',
        },
        // 言語設定画面 -> 国旗アイコン
        iconImage: {
            width: '30@s',
            height: '30@vs',
        },
        // 言語設定画面 -> 国名(日本語、英語、モンゴル語など)
        itemName: {
            fontSize: '20@s',
            fontWeight: '500',
            marginLeft: 15,
        },

        headerTab: {
            height: 5,
            marginBottom: 0,
        },
        tabStyle: {
            marginTop: 0
        },
        rightContainer: {
            alignItems: 'flex-end',
        },
        helpDetail: {
            paddingTop: 5,
            paddingLeft: 10,
            paddingRight: 5,
            paddingBottom: 10,
        },
        helpRow: {
            flexDirection: 'row',
            height: 110,
            paddingTop: 5,
            paddingLeft: 10,
            paddingRight: 10,
            margin: (2, 5, 5, 2),
            backgroundColor: "#DDDDDD",
            justifyContent: "space-between",
        },
        listTitleFont: {
            fontWeight: 'bold',
            fontSize: 14,
        },
        detailItemCol: {
            margin: 0, 
            justifyContent: 'center', 
            alignItems: 'stretch', 
            width: '10%',
        },
        itemLabel: {
            margin: 5,
            fontSize: 14,
        },
        itemText: {
            padding: 5,
            fontSize: 14,
        },
        webView: {
            flex: 1, 
            backgroundColor: 'white', 
        },
        messageText: {
            fontSize: 14,
            marginTop: 10,
            marginLeft: 10,
        },
    });

module.exports = styles;
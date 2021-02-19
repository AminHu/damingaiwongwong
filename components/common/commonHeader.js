/*
 * モジュール名 : 共通ヘッダーのUI部分を表示するコンポーネント
 * 作成日 ：2020/11/20
 * 作成者 : NEC
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */
import React from 'react';

//ReactNativeを使用したコンポーネントの呼び出し
import {TouchableOpacity} from 'react-native';

//NativeBaseを使用したコンポーネントの呼び出し
import {Header,Left,Right,Body,Title,Icon,} from 'native-base';

//ヘッダー用のベースコンポーネントの内容を定義
const CommonHeader = ({ title, onPress, showIcon }) => {
    let leftIcon, rightIcon;
    //アイコン表示制御
    if (showIcon) {
        leftIcon = (
            <TouchableOpacity onPress={onPress}>
                <Icon name="chevron-left" style={{ marginLeft: 20, color: 'white' }} type="FontAwesome5" />
            </TouchableOpacity>
        );
        rightIcon = (
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Icon name="menu" style={{ marginRight: 20, color: 'white' }} type="MaterialIcons" />
            </TouchableOpacity>
        );
    }
    //表示する要素を返す
    return (
        <Header iosBarStyle="light-content" style={styles.header}>
            <Left style={{ flex: 1 }}>
                {leftIcon}
            </Left>
            <Body>
                <Title style={styles.titleStyle}>{title}</Title>
            </Body>
            <Right style={{ flex: 1 }}>
                {rightIcon}
            </Right>
        </Header>
    );
};

//コンポーネントのStyle定義
const styles = {
    header: {
        backgroundColor: '#008348',
    },
    backStyle: {
        color: '#fff',
    },
    titleStyle: {
        color: '#fff',
        alignSelf: "center",
    },
};

export default CommonHeader;
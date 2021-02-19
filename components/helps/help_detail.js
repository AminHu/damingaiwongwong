/*
 * モジュール名 : ヘルプ詳細コンポーネント
 * 作成日 ：2020/11/20
 * 作成者 : NEC
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */
import React, { Component } from 'react';
import { View, TouchableOpacity, LayoutAnimation, Platform, UIManager } from "react-native";
import { Text, Icon, Content } from 'native-base';
import styles from "../common/style";

//コンポーネントの内容を定義
export default class HelpDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
            screenId: 'HBA-0700',
        }

        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }

    // [*] イベント処理:詳細表示
    toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({ expanded: !this.state.expanded })
    }

    //表示する要素を返す
    render() {
        return (
            <View>
                <TouchableOpacity ref={this.accordian} style={styles.helpRow} onPress={() => this.toggleExpand()}>
                    <Content>
                        <Text style={styles.listTitleFont}>{this.props.question}</Text>
                    </Content>
                    {this.state.expanded
                        ? <Icon type="MaterialIcons" name="keyboard-arrow-up" />
                        : <Icon type="MaterialIcons" name="keyboard-arrow-down" />}
                </TouchableOpacity>
                {
                    this.state.expanded &&
                    <Content style={styles.helpDetail} >
                        <Text style={styles.detailItem}>{this.props.answer}</Text>
                    </Content>
                }
            </View>
        )
    }
}

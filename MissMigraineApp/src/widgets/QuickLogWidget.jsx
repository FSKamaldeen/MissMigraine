import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function QuickLogWidget() {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#211136',
        borderRadius: 20,
      }}
      clickAction="OPEN_APP"
      clickActionData={{ uri: 'missmigraine://quick-log' }}
    >
      <TextWidget
        text="Log Migraine"
        style={{
          fontSize: 16,
          color: '#f1ebf9',
          fontWeight: 'bold',
        }}
      />
    </FlexWidget>
  );
}
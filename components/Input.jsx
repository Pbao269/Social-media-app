import { StyleSheet, TextInput, View } from 'react-native'
import React from 'react'
import { theme } from '../constants/theme'
import { hp } from '../helpers/common'

const Input = (props) => {
  return (
    <View style={[styles.container, props.containerStyle && props.containerStyle]}>
      {
        props.icon && props.icon
      }
      <TextInput
        style={[
          styles.textInput, 
          props.multiline && styles.multilineInput, // Add multiline style if multiline is true
          {flex: 1}
        ]}
        placeholderTextColor={theme.colors.textLight}
        ref={props.inputRef && props.inputRef}
        {...props}
      />
    </View>
  )
}

export default Input

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: hp(7.2),
        alignItems: 'center',
        borderWidth: 0.4,
        borderColor: theme.colors.text,
        borderRadius: theme.radius.xxl,
        paddingHorizontal: 18,
        gap: 12
    },
    textInput: {
        flex: 1, 
        textAlignVertical: 'center', // Default to vertically center text
    },
    multilineInput: {
        textAlignVertical: 'top',  // Make sure text starts at the top in multiline mode
        height: hp(15),            // Increase height for multiline input
    }
});

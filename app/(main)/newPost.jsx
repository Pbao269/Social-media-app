import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import Header from '../../components/Header'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../../components/Avatar'
import RichTextEditor from '../../components/RichTextEditor'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Icon from '../../assets/icons'
import { TouchableOpacity } from 'react-native'
import Button from '../../components/Button'
import * as ImagePicker from 'expo-image-picker'
import { getSupabaseFileUrl } from '../../services/imageService'
import { Video } from 'expo-av'
import { createOrUpdatePost } from '../../services/postService'

const NewPost = () => {

    const post = useLocalSearchParams();
    console.log('post:', post);
    const {user} = useAuth();
    const bodyRef = useRef("");
    const editorRef = useRef(null);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(file);

    useEffect(()=>{
        if(post && post.id){
            bodyRef.current = post.body;
            setFile(post.file || null);
            setTimeout(()=>{
                editorRef?.current?.setContentHTML(post.body);
            }, 50);
        }
    },[])

    const onPick = async (isImage)=>{

        let mediaConfig = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4,3],
            quality: 0.7
        }
        if(!isImage){
            mediaConfig ={
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
            }
        }
        let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);

        if(!result.canceled){
            setFile(result.assets[0]);
        }
    }
    const isLocalFile = file=>{
        if(!file) return null;
        if(typeof file =='object') return true;

        return false;
    }
    const getFileType = file => {
        if(!file) return null;
        if(isLocalFile(file)){
            return file.type;
        }

        if(file.includes('postImages')){
            return 'image';
        }
        return 'video';
    }
    const getFileUri = file =>{
        if(!file) return null;
        if(isLocalFile(file)){
            return file.uri;
        }
        return getSupabaseFileUrl(file)?.uri;
    }
    const onSubmit = async() =>{
        if(!bodyRef.current && !file){
            Alert.alert('Post', "Please choose a media or add post body");
            return;
        }
        let data = {
            file,
            body: bodyRef.current,
            userId: user?.id,
        }
        if (post && post.id) data.id = post.id;

        setLoading(true);
        let res = await createOrUpdatePost(data);
        setLoading(false);
        if(res.success){
            setFile(null);
            bodyRef.current='';
            editorRef.current?.setContentHTML('');
            router.back();

        }else{
            Alert.alert('Post', res.msg);
        }
    }
    console.log('file uri: ', getFileUri(file));
  return (
    <ScreenWrapper bg="white">
        <View style ={styles.container} >
            <Header title="Create Post" />
            <ScrollView contentContainerStyle={{gap: 20}}>
                {/* avatar */}
                <View style={styles.header} >
                    <Avatar
                        uri={user?.image}
                        size={hp(6.5)}
                        rounded={theme.radius.xl}
                    />
                    <View style={{gap: 2}}>
                        <Text style={styles.username}>
                            {  
                                user && user.name
                            }
                        </Text>

                        <Text style={styles.publicText}>
                            Public
                        </Text>   
                    </View>
                </View>
                <View style={styles.textEditor}>
                    <RichTextEditor editorRef ={editorRef} onChange={body=>bodyRef.current=body} />
                </View>
                {
                    file && (
                        <View style={styles.file}>
                            {
                                getFileType(file) == 'video'? (
                                    <Video 
                                        style={{flex: 1}}
                                        source={{
                                            uri: getFileUri(file)
                                        }}
                                        useNativeControls
                                        resizeMode='cover'
                                        isLooping
                                    />
                                ):(
                                    <Image source={{uri:getFileUri(file)}} resizeMode='cover' style={{flex:1}} />
                                )
                            }
                            <Pressable style={styles.closeIcon} onPress={()=> setFile(null)}>
                                <Icon name="delete" size={20} color='white' />
                            </Pressable>
                        </View>
                    )
                }
                <View style={styles.media}>
                    <Text style={styles.addImageText}>Add to your post</Text>
                    <View style={styles.mediaIcons}>
                        <TouchableOpacity onPress={()=> onPick(true)}>
                            <Icon name="image" size={30} theme={theme.colors.dark} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=> onPick(false)}>
                            <Icon name="video" size={30} theme={theme.colors.dark} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <Button
                buttonStyle={{height: hp(6.2)}}
                title={post && post.id? "Update": "Post"}
                loading={loading}
                hasShadow={false}
                onPress={onSubmit}
            />
        </View>
    </ScreenWrapper>
  )
}

export default NewPost

const styles = StyleSheet.create({
    closeIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 7,
        borderRadius: 50,
        backgroundColor: 'rgba(255,0,0, 0.6)'
        // shadowColor: theme.colors.textLight,
        // shadowOffset: {width: 0, height: 3},
        // shadowOpacity: 0.6,
        // shadowRadius: 8
    },
    video: {

    },
    file: {
        height: hp(30),
        width: '100%',
        borderRadius: theme.radius.xxl,
        overflow: 'hidden',
        borderCurve: 'continuous'
    },
    imageIcon: {
        // backgroundColor: theme.colors.gray,
        // padding: 6,
        borderRadius: theme.radius.md
    },
    textEditor: {
        // marginTop: 10
    },
    addImageText: {
        fontSize: hp(1.9),
        fontWeight: theme.fonts.semibold,
        color: theme.colors.text
    },  
    mediaIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },
    media: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1.5,
        padding: 12,
        paddingHorizontal: 18,
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous',
        borderColor: theme.colors.gray
    },
    publicText: {
        fontSize: hp(1.7),
        fontWeight: theme.fonts.medium,
        color: theme.colors.textLight
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    username: {
        fontSize: hp(2.2),
        fontWeight: theme.fonts.semibold,
        color: theme.colors.text
    },
    avatar: {
        height: hp(6.5),
        width: hp(6.5),
        borderCurve: 'continuous',
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)'
    },
    container: {
        flex: 1,
        marginBottom: 30,
        paddingHorizontal: wp(4),
        gap: 15
    },
    title: {
        // marginBottom: 10,
        fontSize: hp(2.5),
        fontWeight: theme.fonts.semibold,
        color: theme.colors.text,
        textAlign: 'center'
    }
})
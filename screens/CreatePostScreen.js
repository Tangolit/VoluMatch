// Create Post Screen - Direct conversion from Figma Make HTML
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '../components/LazyIonicons';
import { createCommunityPost } from '../services/firestore';

const CreatePostScreen = ({ navigation, route, user, userProfile }) => {
  const { communityId, communityName } = route.params || {};
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState('Chicago, IL');
  const [showLocation, setShowLocation] = useState(true);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateContent = () => {
    const trimmedContent = content.trim();
    
    if (!trimmedContent && images.length === 0) {
      Alert.alert('Validation Error', 'Please enter some content or add an image.');
      return false;
    }
    
    if (trimmedContent.length > 0 && trimmedContent.length < 10) {
      Alert.alert('Validation Error', 'Post content must be at least 10 characters long.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateContent()) return;

    try {
      setLoading(true);
      
      await createCommunityPost(communityId, user.uid, content.trim());
      
      Alert.alert(
        'Success!',
        'Your post has been created successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = (content.trim().length >= 10 || images.length > 0) && !loading;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Navigation */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color="#131316" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Create Post</Text>
          
          <TouchableOpacity
            style={[styles.postButton, canSubmit && styles.postButtonEnabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[styles.postButtonText, !canSubmit && styles.postButtonTextDisabled]}>
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Main Content Area */}
        <ScrollView 
          style={styles.mainContent}
          contentContainerStyle={styles.mainContentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* User Context */}
          <View style={styles.userContext}>
            <Image
              source={{ uri: user?.photoURL || userProfile?.photoURL || 'https://randomuser.me/api/portraits/women/44.jpg' }}
              style={styles.userAvatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {userProfile?.displayName || user?.displayName || 'City Food Bank'}
              </Text>
              <TouchableOpacity style={styles.postingToButton}>
                <Text style={styles.postingToText}>Posting to {communityName || 'Volunteers'}</Text>
                <Ionicons name="chevron-down" size={14} color="#6b6c80" />
              </TouchableOpacity>
            </View>
        </View>

          {/* Text Input */}
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Share an opportunity or update... We are looking for volunteers to help sort canned goods this Saturday!"
              placeholderTextColor="#bfc0ca"
              multiline
              autoFocus
              value={content}
              onChangeText={setContent}
              maxLength={5000}
            />
          </View>
          
          {/* Media Attachments */}
          {(images.length > 0 || true) && (
            <View style={styles.mediaSection}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mediaScroll}
              >
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri }} style={styles.attachedImage} />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close" size={14} color="#fff" />
                    </TouchableOpacity>
          </View>
                ))}
                
                {/* Add Image Button */}
                <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                  <Ionicons name="camera" size={24} color="#6b6c80" />
                </TouchableOpacity>
              </ScrollView>
        </View>
          )}
        </ScrollView>

        {/* Toolbar */}
        <SafeAreaView edges={['bottom']} style={styles.toolbarSafeArea}>
          <View style={styles.toolbar}>
            <View style={styles.toolbarButtons}>
              <TouchableOpacity style={styles.toolbarButton} onPress={takePhoto}>
                <Ionicons name="camera" size={24} color="#1c1f4a" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.toolbarButton} onPress={pickImage}>
                <Ionicons name="image" size={24} color="#1c1f4a" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.toolbarButton}>
                <Ionicons name="location" size={24} color="#1c1f4a" />
              </TouchableOpacity>
              
              <View style={styles.toolbarDivider} />
              
              <TouchableOpacity style={styles.toolbarButton}>
                <Ionicons name="at" size={24} color="#6b6c80" />
              </TouchableOpacity>
        </View>

            {/* Location Tag Preview */}
            {showLocation && (
              <View style={styles.locationTagContainer}>
                <View style={styles.locationTag}>
                  <Ionicons name="location" size={14} color="#1c1f4a" />
                  <Text style={styles.locationTagText}>{location}</Text>
                  <TouchableOpacity 
                    style={styles.removeLocationButton}
                    onPress={() => setShowLocation(false)}
                  >
                    <Ionicons name="close" size={14} color="#1c1f4a" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f8',
  },
  headerSafeArea: {
    backgroundColor: '#f6f6f8',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#131316',
    letterSpacing: -0.3,
  },
  postButton: {
    backgroundColor: '#1c1f4a',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postButtonEnabled: {
    opacity: 1,
  },
  postButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  postButtonTextDisabled: {
    opacity: 0.5,
  },
  mainContent: {
    flex: 1,
  },
  mainContentContainer: {
    paddingBottom: 20,
  },
  userContext: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#131316',
    lineHeight: 20,
  },
  postingToButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  postingToText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b6c80',
  },
  textInputContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    fontSize: 18,
    lineHeight: 28,
    color: '#131316',
    minHeight: 150,
    textAlignVertical: 'top',
  },
  mediaSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  mediaScroll: {
    gap: 12,
    paddingBottom: 8,
  },
  imageContainer: {
    position: 'relative',
  },
  attachedImage: {
    width: 96,
    height: 96,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dedee3',
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addImageButton: {
    width: 96,
    height: 96,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#dedee3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarSafeArea: {
    backgroundColor: '#f6f6f8',
    borderTopWidth: 1,
    borderTopColor: '#dedee3',
  },
  toolbar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toolbarButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  toolbarButton: {
    padding: 8,
    borderRadius: 20,
  },
  toolbarDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#dedee3',
    marginHorizontal: 4,
  },
  locationTagContainer: {
    marginTop: 8,
    flexDirection: 'row',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(28, 31, 74, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  locationTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1c1f4a',
  },
  removeLocationButton: {
    marginLeft: 4,
  },
});

export default CreatePostScreen;

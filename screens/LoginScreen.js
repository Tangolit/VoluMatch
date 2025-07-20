import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = () => {
    // Placeholder for Firebase Auth integration
    console.log('Log In:', email, password);
    navigation.navigate('Home'); // Simulate successful login
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Log In</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ marginBottom: 10 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 10 }}
      />
      <Button title="Log In" onPress={handleLogin} />
    </View>
  );
};

export default LoginScreen; 
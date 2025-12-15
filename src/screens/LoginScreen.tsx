import React, { useState, useEffect } from 'react';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form-control';
import { Checkbox, CheckboxIndicator, CheckboxIcon, CheckboxLabel } from '@/components/ui/checkbox';
import { Pressable } from '@/components/ui/pressable';

import { Box } from '@/components/ui/box';
import { Toast, ToastTitle, useToast } from '@/components/ui/toast';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthService } from '@/src/services/authService';
import { setLoading, setUser, setError } from '@/src/store/authSlice';
import { RootState } from '@/src/store';
import { CheckIcon, EyeIcon, EyeOffIcon } from '@/components/ui/icon';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const toast = useToast();

  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('rememberedEmail');
      const savedPassword = await AsyncStorage.getItem('rememberedPassword');
      const wasRemembered = await AsyncStorage.getItem('rememberMe');
      
      if (savedEmail && savedPassword && wasRemembered === 'true') {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    } catch (error) {
      console.log('Erro ao carregar credenciais salvas:', error);
    }
  };

  const saveCredentials = async () => {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem('rememberedEmail', email);
        await AsyncStorage.setItem('rememberedPassword', password);
        await AsyncStorage.setItem('rememberMe', 'true');
      } else {
        await AsyncStorage.removeItem('rememberedEmail');
        await AsyncStorage.removeItem('rememberedPassword');
        await AsyncStorage.removeItem('rememberMe');
      }
    } catch (error) {
      console.log('Erro ao salvar credenciais:', error);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      dispatch(setLoading(true));
      try {
        const user = await AuthService.login(email, password);
        

        await saveCredentials();
        
        dispatch(setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        }));
        
        toast.show({
          placement: 'top',
          render: ({ id }) => {
            return (
              <Toast nativeID={id} action="success" variant="accent">
                <ToastTitle>Login realizado com sucesso!</ToastTitle>
              </Toast>
            );
          },
        });
        
        router.replace('/home');
      } catch (error: any) {
        let errorMessage = 'Erro ao fazer login';
        
        if (error.code === 'auth/user-not-found') {
          errorMessage = 'Usuário não encontrado';
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = 'Senha incorreta';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Email inválido';
        } else if (error.code === 'auth/user-disabled') {
          errorMessage = 'Usuário desabilitado';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = 'Erro de conexão. Verifique sua internet';
        } else if (error.code === 'auth/invalid-credential') {
          errorMessage = 'Email ou senha incorretos';
        }
        
        dispatch(setError(errorMessage));
        
        toast.show({
          placement: 'top',
          render: ({ id }) => {
            return (
              <Toast nativeID={id} action="error" variant="accent">
                <ToastTitle>{errorMessage}</ToastTitle>
              </Toast>
            );
          },
        });
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  return (
    <Box className="flex-1 bg-background-0" style={{ paddingTop: insets.top }}>
      <VStack className="flex-1 p-6 justify-center" space="lg">

        <VStack space="sm" className="mb-8">
          <Text className="text-4xl font-bold text-typography-900">Login to your account</Text>
          <HStack space="xs">
            <Text className="text-typography-500">Don't have an account?</Text>
            <Pressable onPress={() => router.push('/cadastro')}>
              <Text className="text-typography-500 underline font-medium">Sign up</Text>
            </Pressable>
          </HStack>
        </VStack>


        <FormControl isInvalid={!!errors.email}>
          <Text className="text-typography-900 mb-2 font-medium">Email</Text>
          <Input>
            <InputField
              value={email}
              onChangeText={setEmail}
              placeholder="abc@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Input>
          {errors.email && <Text style={{ color: 'red', fontSize: 14, marginTop: 4 }}>{errors.email}</Text>}
        </FormControl>


        <FormControl isInvalid={!!errors.password}>
          <Text className="text-typography-900 mb-2 font-medium">Password</Text>
          <Input>
            <InputField
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry={!showPassword}
              className="flex-1"
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} className="p-2">
              {showPassword ? 
                <EyeOffIcon size="sm" /> : 
                <EyeIcon size="sm" />
              }
            </Pressable>
          </Input>
          {errors.password && <Text style={{ color: 'red', fontSize: 14, marginTop: 4 }}>{errors.password}</Text>}
        </FormControl>


        <HStack className="justify-between items-center">
          <Checkbox 
            value="rememberMe" 
            isChecked={rememberMe} 
            onChange={(isChecked) => setRememberMe(isChecked)}
          >
            <CheckboxIndicator>
              <CheckboxIcon as={CheckIcon} />
            </CheckboxIndicator>
            <CheckboxLabel className="ml-2">Remember me</CheckboxLabel>
          </Checkbox>
          
          <Pressable>
            <Text className="text-typography-500 underline font-medium">Forgot Password?</Text>
          </Pressable>
        </HStack>


        {error && <Text style={{ color: 'red', fontSize: 14, textAlign: 'center' }}>{error}</Text>}


        <Button 
          onPress={handleLogin} 
          disabled={loading}
          className="mt-4"
          style={{ backgroundColor: '#22c55e' }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Text>
        </Button>


      </VStack>
    </Box>
  );
}
import React, { useState } from 'react';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form-control';
import { Toast, ToastTitle, useToast } from '@/components/ui/toast';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthService } from '@/src/services/authService';
import { setLoading, setUser, setError } from '@/src/store/authSlice';
import { RootState } from '@/src/store';

export default function CadastroScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const toast = useToast();

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
    
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (validateForm()) {
      dispatch(setLoading(true));
      try {
        const user = await AuthService.register(email, password);
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
                <ToastTitle>Conta criada com sucesso!</ToastTitle>
              </Toast>
            );
          },
        });
        
        router.replace('/home');
      } catch (error: any) {
        let errorMessage = 'Erro ao criar conta';
        
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Este email já está em uso';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Email inválido';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Senha muito fraca';
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = 'Erro de conexão. Verifique sua internet';
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
      }
    }
  };

  return (
    <VStack className="flex-1 p-4 bg-background-0 justify-center" space="md" style={{ paddingTop: insets.top }}>
      <Text className="text-3xl font-bold text-center mb-8">Cadastro</Text>
      
      <FormControl isInvalid={!!errors.email}>
        <Text className="mb-2">Email</Text>
        <Input>
          <InputField
            value={email}
            onChangeText={setEmail}
            placeholder="Digite seu email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Input>
        {errors.email && <Text style={{ color: 'red', fontSize: 14, marginTop: 4 }}>{errors.email}</Text>}
      </FormControl>

      <FormControl isInvalid={!!errors.password}>
        <Text className="mb-2">Senha</Text>
        <Input>
          <InputField
            value={password}
            onChangeText={setPassword}
            placeholder="Digite sua senha"
            secureTextEntry
          />
        </Input>
        {errors.password && <Text style={{ color: 'red', fontSize: 14, marginTop: 4 }}>{errors.password}</Text>}
      </FormControl>

      <FormControl isInvalid={!!errors.confirmPassword}>
        <Text className="mb-2">Confirmar Senha</Text>
        <Input>
          <InputField
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirme sua senha"
            secureTextEntry
          />
        </Input>
        {errors.confirmPassword && <Text style={{ color: 'red', fontSize: 14, marginTop: 4 }}>{errors.confirmPassword}</Text>}
      </FormControl>

      {error && <Text style={{ color: 'red', fontSize: 14, textAlign: 'center', marginTop: 8 }}>{error}</Text>}

      <Button 
        onPress={handleRegister} 
        className="mt-4" 
        disabled={loading}
        style={{ backgroundColor: '#22c55e' }}
      >
        <ButtonText style={{ color: 'white' }}>
          {loading ? 'Criando...' : 'Criar Conta'}
        </ButtonText>
      </Button>

      <Button 
        variant="outline" 
        onPress={() => {
          dispatch(setError(''));
          router.back();
        }} 
        className="mt-2"
        style={{ borderColor: '#6b7280' }}
      >
        <ButtonText style={{ color: '#6b7280' }}>Voltar ao Login</ButtonText>
      </Button>
    </VStack>
  );
}
import React, { useEffect } from 'react';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button, ButtonText } from '@/components/ui/button';
import { FlatList } from '@/components/ui/flat-list';
import { Image } from '@/components/ui/image';
import { Toast, ToastTitle, useToast } from '@/components/ui/toast';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/src/store';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FirebaseService } from '@/src/services/firebaseService';
import { setComunidades } from '@/src/store/comunidadesSlice';
import { Fab, FabIcon } from '@/components/ui/fab';
import { AddIcon } from '@/components/ui/icon';
import { LinearGradient } from 'expo-linear-gradient';
import BottomTabBar from '@/src/components/BottomTabBar';


export default function ComunidadesScreen() {
  const { items: comunidades, loading } = useSelector((state: RootState) => state.comunidades);
  const dispatch = useDispatch();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadComunidades();
  }, []);

  const loadComunidades = async () => {
    try {
      const comunidadesFromFirebase = await FirebaseService.getComunidades();
      dispatch(setComunidades(comunidadesFromFirebase));
    } catch (error) {
      console.error('Erro ao carregar comunidades:', error);
      toast.show({
        placement: 'top',
        render: ({ id }) => {
          return (
            <Toast nativeID={id} action="error" variant="accent">
              <ToastTitle>Erro ao carregar comunidades</ToastTitle>
            </Toast>
          );
        },
      });
    }
  };

  const handleEdit = (comunidade: any) => {
    router.push({
      pathname: '/cadastro-comunidade',
      params: {
        id: comunidade.id,
        nome: comunidade.nome,
        lider: comunidade.liderComunidade,
        gerencia: comunidade.gerencia,
        descricao: comunidade.descricao || '',
        imageUri: comunidade.imageUri || ''
      }
    });
  };

  const handleDelete = async (comunidade: any) => {
    try {
      await FirebaseService.deleteComunidade(comunidade.id);
      await loadComunidades();
      
      toast.show({
        placement: 'top',
        render: ({ id }) => {
          return (
            <Toast nativeID={id} action="success" variant="accent">
              <ToastTitle>Comunidade excluída com sucesso!</ToastTitle>
            </Toast>
          );
        },
      });
    } catch (error) {
      toast.show({
        placement: 'top',
        render: ({ id }) => {
          return (
            <Toast nativeID={id} action="error" variant="accent">
              <ToastTitle>Erro ao excluir comunidade</ToastTitle>
            </Toast>
          );
        },
      });
      console.error('Erro ao excluir comunidade:', error);
    }
  };

  const renderComunidade = ({ item }: any) => (
    <Card className="m-2 p-4">
      <VStack space="sm">
        <HStack className="justify-between items-start">
          <HStack space="md" className="flex-1">
            {item.imageUri && (
              <Image 
                source={{ uri: item.imageUri }} 
                style={{ width: 60, height: 60, borderRadius: 8 }}
                alt={`Imagem da ${item.nome}`}
              />
            )}
            <VStack space="xs" className="flex-1">
              <Text className="font-bold text-lg">{item.nome}</Text>
              <Text>Líder: {item.liderComunidade}</Text>
              <Text>Gerência Responsável: {item.gerencia}</Text>
            </VStack>
          </HStack>
          <VStack space="xs">
            <Button 
              size="sm" 
              style={{ backgroundColor: '#3b82f6' }}
              onPress={() => handleEdit(item)}
            >
              <ButtonText style={{ color: 'white' }}>Editar</ButtonText>
            </Button>
            <Button 
              size="sm" 
              style={{ backgroundColor: '#ef4444' }}
              onPress={() => handleDelete(item)}
            >
              <ButtonText style={{ color: 'white' }}>Excluir</ButtonText>
            </Button>
          </VStack>
        </HStack>
      </VStack>
    </Card>
  );

  return (
    <VStack className="flex-1 bg-background-0">
      <LinearGradient
        colors={['#6366f1', '#8b5cf6', '#a855f7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + 20,
          paddingBottom: 24,
          paddingHorizontal: 16,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5
        }}
      >
        <VStack space="xs">
          <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', textAlign: 'center', lineHeight: 36 }}>Comunidades</Text>
        </VStack>
      </LinearGradient>
      
      <VStack className="flex-1 p-4">
        <FlatList
          data={comunidades}
          renderItem={renderComunidade}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={{ marginTop: 8 }}
        />
      </VStack>
      
      <Fab
        onPress={() => router.push('/cadastro-comunidade')}
        placement="bottom center"
        size="lg"
        style={{
          backgroundColor: '#22c55e',
          bottom: 120
        }}
      >
        <FabIcon as={AddIcon} color="white" />
      </Fab>
      

      <BottomTabBar activeTab="comunidades" />
    </VStack>
  );
}
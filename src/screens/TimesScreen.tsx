import React, { useEffect } from 'react';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button, ButtonText } from '@/components/ui/button';
import { FlatList } from '@/components/ui/flat-list';
import { Toast, ToastTitle, useToast } from '@/components/ui/toast';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/src/store';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fab, FabIcon } from '@/components/ui/fab';
import { AddIcon } from '@/components/ui/icon';
import { setTimes } from '@/src/store/timesSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { FirebaseService } from '@/src/services/firebaseService';
import BottomTabBar from '@/src/components/BottomTabBar';



export default function TimesScreen() {
  const { items: times } = useSelector((state: RootState) => state.times);
  const { items: comunidades } = useSelector((state: RootState) => state.comunidades);
  const dispatch = useDispatch();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    loadTimes();
  }, []);

  const loadTimes = async () => {
    try {
      const timesFromFirebase = await FirebaseService.getTimes();
      dispatch(setTimes(timesFromFirebase));
    } catch (error) {
      console.error('Erro ao carregar times:', error);
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="accent">
            <ToastTitle>Erro ao carregar times</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  const getComunidadeNome = (comunidadeId: string) => {
    const comunidade = comunidades.find(c => c.id === comunidadeId);
    return comunidade?.nome || 'Comunidade não encontrada';
  };

  const handleEdit = (time: any) => {
    const comunidade = comunidades.find(c => c.id === time.comunidadeId);
    router.push({
      pathname: '/cadastro-time',
      params: {
        id: time.id,
        nome: time.nome,
        analistaRelacionamento: time.analistaRelacionamento,
        desenvolvedor: time.desenvolvedor,
        comunidadeId: time.comunidadeId,
        comunidadeNome: comunidade?.nome || ''
      }
    });
  };

  const handleDelete = async (time: any) => {
    try {
      await FirebaseService.deleteTime(time.id);
      await loadTimes();
      
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={id} action="success" variant="accent">
            <ToastTitle>Time excluído com sucesso!</ToastTitle>
          </Toast>
        ),
      });
    } catch (error) {
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="accent">
            <ToastTitle>Erro ao excluir time</ToastTitle>
          </Toast>
        ),
      });
      console.error('Erro ao excluir time:', error);
    }
  };

  const renderTime = ({ item }: any) => (
    <Card className="m-2 p-4">
      <VStack space="sm">
        <HStack className="justify-between items-start">
          <VStack space="xs" className="flex-1">
            <Text className="font-bold text-lg">{item.nome}</Text>
            <Text>Analista: {item.analistaRelacionamento}</Text>
            <Text>Desenvolvedor: {item.desenvolvedor}</Text>
            <Text>Comunidade: {getComunidadeNome(item.comunidadeId)}</Text>
          </VStack>
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
          <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', textAlign: 'center', lineHeight: 36 }}>Times</Text>
        </VStack>
      </LinearGradient>
      
      <VStack className="flex-1 p-4">
        <FlatList
          data={times}
          renderItem={renderTime}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={{ marginTop: 8 }}
        />
      </VStack>
      
      <Fab
        onPress={() => router.push('/cadastro-time')}
        placement="bottom center"
        size="lg"
        style={{
          backgroundColor: '#22c55e',
          bottom: 120
        }}
      >
        <FabIcon as={AddIcon} color="white" />
      </Fab>
      

      <BottomTabBar activeTab="times" />
    </VStack>
  );
}
import React, { useEffect } from 'react';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { ScrollView } from '@/components/ui/scroll-view';
import { Accordion, AccordionItem, AccordionHeader, AccordionTrigger, AccordionTitleText, AccordionIcon, AccordionContent } from '@/components/ui/accordion';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableData } from '@/components/ui/table';
import { Avatar, AvatarFallbackText } from '@/components/ui/avatar';
import { Image } from '@/components/ui/image';
import { ChevronDownIcon } from '@/components/ui/icon';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { setComunidades } from '@/src/store/comunidadesSlice';
import { setTimes } from '@/src/store/timesSlice';
import { RootState } from '@/src/store';
import { FirebaseService } from '@/src/services/firebaseService';
import { NotificationService } from '@/src/services/notificationService';
import { UpdateService } from '../src/services/updateService';
import { LinearGradient } from 'expo-linear-gradient';
import BottomTabBar from '@/src/components/BottomTabBar';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items: comunidades } = useSelector((state: RootState) => state.comunidades);
  const { items: times } = useSelector((state: RootState) => state.times);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    } else {
      loadData();
      setupNotifications();
    }
  }, [user, router]);

  const setupNotifications = async () => {
    try {
      await NotificationService.registerForPushNotificationsAsync();
      await NotificationService.scheduleLocalNotification(
        'Bem-vindo ao CE Manager!',
        'Gerencie suas comunidades e times de forma eficiente.',
        2,
        '/comunidades'
      );
      await UpdateService.checkForUpdates();
    } catch (error) {
      console.log('Setup error:', error);
    }
  };

  const loadData = async () => {
    try {
      const [comunidadesData, timesData] = await Promise.all([
        FirebaseService.getComunidades(),
        FirebaseService.getTimes()
      ]);
      dispatch(setComunidades(comunidadesData));
      dispatch(setTimes(timesData));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const getTimesByComunidade = (comunidadeId: string) => {
    return times.filter(time => time.comunidadeId === comunidadeId);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  return (
    <VStack className="flex-1 bg-background-0">
      <LinearGradient
        colors={['#6366f1', '#8b5cf6', '#a855f7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + 20,
          paddingBottom: 32,
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
          <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', textAlign: 'center', lineHeight: 36 }}>Visão geral</Text>
        </VStack>
      </LinearGradient>
      
      <ScrollView className="flex-1 p-4">
        <Accordion className="w-full">
          {comunidades.map((comunidade) => {
            const timesComunidade = getTimesByComunidade(comunidade.id);
            return (
              <AccordionItem key={comunidade.id} value={comunidade.id}>
                <AccordionHeader>
                  <AccordionTrigger>
                    <AccordionTitleText className="font-semibold text-2xl">{comunidade.nome}</AccordionTitleText>
                    <AccordionIcon as={ChevronDownIcon} className="ml-3" />
                  </AccordionTrigger>
                </AccordionHeader>
                <AccordionContent>
                  <VStack space="lg" className="px-0 py-4">

                    {comunidade.imageUri && (
                      <Box className="items-center">
                        <Image 
                          source={{ uri: comunidade.imageUri }} 
                          style={{ width: 280, height: 280, borderRadius: 12 }}
                          alt={`Imagem da ${comunidade.nome}`}
                        />
                      </Box>
                    )}
                    

                    <HStack className="items-center" space="sm">
                      <Avatar size="sm">
                        <AvatarFallbackText>{getInitials(comunidade.liderComunidade)}</AvatarFallbackText>
                      </Avatar>
                      <Text className="font-semibold">{comunidade.liderComunidade}</Text>
                    </HStack>
                    

                    {comunidade.descricao && (
                      <Text className="text-xl text-gray-700">{comunidade.descricao}</Text>
                    )}
                    

                    {timesComunidade.length > 0 && (
                      <VStack space="sm">
                        <Box className="-mx-6">
                          <Table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
                          <TableHeader>
                            <TableRow>
                              <TableHead style={{ width: '20%', fontSize: 13, padding: 0, margin: 0, textAlign: 'left' }}>Time</TableHead>
                              <TableHead style={{ width: '30%', fontSize: 13, padding: 0, margin: 0, textAlign: 'left' }}>Analista</TableHead>
                              <TableHead style={{ width: '50%', fontSize: 13, padding: 0, margin: 0, textAlign: 'left' }}>Desenvolvedor</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {timesComunidade.map((time) => (
                              <TableRow key={time.id}>
                                <TableData style={{ width: '20%', fontSize: 14, padding: 0, margin: 0, textAlign: 'left' }}>{time.nome}</TableData>
                                <TableData style={{ width: '40%', fontSize: 14, padding: 0, margin: 0, textAlign: 'left' }}>{time.analistaRelacionamento}</TableData>
                                <TableData style={{ width: '40%', fontSize: 14, padding: 0, margin: 0, textAlign: 'left' }}>{time.desenvolvedor}</TableData>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        </Box>
                      </VStack>
                    )}
                  </VStack>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </ScrollView>
      
      <BottomTabBar activeTab="home" />
    </VStack>
  );
}
import React, { useState, useEffect } from 'react';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form-control';
import { Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator, SelectItem } from '@/components/ui/select';
import { Toast, ToastTitle, useToast } from '@/components/ui/toast';
import { useDispatch, useSelector } from 'react-redux';
import { addTime, updateTime } from '@/src/store/timesSlice';
import { setCharacters } from '@/src/store/charactersSlice';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FirebaseService } from '@/src/services/firebaseService';
import { ChevronDownIcon } from '@/components/ui/icon';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState } from '@/src/store';

export default function CadastroTimeScreen() {
  const params = useLocalSearchParams();
  const isEditing = !!params.id;
  
  const [nome, setNome] = useState('');
  const [analistaRelacionamento, setAnalistaRelacionamento] = useState('');
  const [desenvolvedor, setDesenvolvedor] = useState('');
  const [comunidadeId, setComunidadeId] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  
  const { items: comunidades } = useSelector((state: RootState) => state.comunidades);
  const { items: characters } = useSelector((state: RootState) => state.characters);
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const toast = useToast();

  useEffect(() => {
    if (characters.length === 0) {
      fetchCharacters();
    }
    
    if (isEditing && params.id) {
      setNome(String(params.nome || ''));
      setAnalistaRelacionamento(String(params.analistaRelacionamento || ''));
      setDesenvolvedor(String(params.desenvolvedor || ''));
      setComunidadeId(String(params.comunidadeId || ''));
    }
  }, [params.id, characters.length]);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('https://rickandmortyapi.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetCharacters {
              characters {
                results {
                  id
                  name
                  status
                  species
                  image
                  location {
                    name
                  }
                }
              }
            }
          `,
        }),
      });
      const result = await response.json();
      if (result.data?.characters?.results) {
        dispatch(setCharacters(result.data.characters.results));
      }
    } catch (error) {
      console.log('Erro ao carregar personagens:', error);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!analistaRelacionamento.trim()) newErrors.analistaRelacionamento = 'Analista é obrigatório';
    if (!desenvolvedor.trim()) newErrors.desenvolvedor = 'Desenvolvedor é obrigatório';
    if (!comunidadeId) newErrors.comunidadeId = 'Comunidade é obrigatória';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        const timeData = {
          nome,
          analistaRelacionamento,
          desenvolvedor,
          comunidadeId,
        };
        
        if (isEditing) {
          await FirebaseService.updateTime(params.id as string, timeData);
          
          dispatch(updateTime({
            id: params.id as string,
            ...timeData
          }));
          
          toast.show({
            placement: 'top',
            render: ({ id }) => (
              <Toast nativeID={id} action="success" variant="accent">
                <ToastTitle>Time atualizado com sucesso!</ToastTitle>
              </Toast>
            ),
          });
        } else {
          const firebaseId = await FirebaseService.addTime(timeData);
          
          dispatch(addTime({
            id: firebaseId,
            ...timeData
          }));
          
          toast.show({
            placement: 'top',
            render: ({ id }) => (
              <Toast nativeID={id} action="success" variant="accent">
                <ToastTitle>Time criado com sucesso!</ToastTitle>
              </Toast>
            ),
          });
        }
        
        router.back();
      } catch (error) {
        toast.show({
          placement: 'top',
          render: ({ id }) => (
            <Toast nativeID={id} action="error" variant="accent">
              <ToastTitle>Erro ao salvar time</ToastTitle>
            </Toast>
          ),
        });
        console.error('Erro ao salvar time:', error);
      } finally {
        setLoading(false);
      }
    }
  };

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
          <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', textAlign: 'center', lineHeight: 36 }}>
            {isEditing ? 'Editar Time' : 'Novo Time'}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, textAlign: 'center' }}>
            {isEditing ? 'Atualize os dados do time' : 'Crie um novo time'}
          </Text>
        </VStack>
      </LinearGradient>
      
      <VStack className="flex-1 p-4" space="md">
        <FormControl isInvalid={!!errors.nome}>
          <Text className="mb-2">Nome do Time</Text>
          <Input>
            <InputField
              value={nome}
              onChangeText={setNome}
              placeholder="Digite o nome do time"
            />
          </Input>
          {errors.nome && <Text style={{ color: 'red', fontSize: 14, marginTop: 4 }}>{errors.nome}</Text>}
        </FormControl>

        <FormControl isInvalid={!!errors.analistaRelacionamento}>
          <Text className="mb-2">Analista de Relacionamento</Text>
          <Select selectedValue={analistaRelacionamento} onValueChange={setAnalistaRelacionamento}>
            <SelectTrigger variant="outline" size="md">
              <SelectInput placeholder="Selecione um analista" />
              <SelectIcon className="mr-3" as={ChevronDownIcon} />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                {characters.map((character) => (
                  <SelectItem key={character.id} label={character.name} value={character.name} />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
          {errors.analistaRelacionamento && <Text style={{ color: 'red', fontSize: 14, marginTop: 4 }}>{errors.analistaRelacionamento}</Text>}
        </FormControl>

        <FormControl isInvalid={!!errors.desenvolvedor}>
          <Text className="mb-2">Desenvolvedor</Text>
          <Select selectedValue={desenvolvedor} onValueChange={setDesenvolvedor}>
            <SelectTrigger variant="outline" size="md">
              <SelectInput placeholder="Selecione um desenvolvedor" />
              <SelectIcon className="mr-3" as={ChevronDownIcon} />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                {characters.map((character) => (
                  <SelectItem key={character.id} label={character.name} value={character.name} />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
          {errors.desenvolvedor && <Text style={{ color: 'red', fontSize: 14, marginTop: 4 }}>{errors.desenvolvedor}</Text>}
        </FormControl>

        <FormControl isInvalid={!!errors.comunidadeId}>
          <Text className="mb-2">Comunidade</Text>
          <Select selectedValue={comunidadeId} onValueChange={setComunidadeId}>
            <SelectTrigger>
              <SelectInput 
                placeholder="Selecione uma comunidade"
                value={comunidadeId ? comunidades.find(c => c.id === comunidadeId)?.nome : ''}
              />
              <SelectIcon as={ChevronDownIcon} />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                {comunidades.map((comunidade) => (
                  <SelectItem key={comunidade.id} label={comunidade.nome} value={comunidade.id} />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
          {errors.comunidadeId && <Text style={{ color: 'red', fontSize: 14, marginTop: 4 }}>{errors.comunidadeId}</Text>}
        </FormControl>

        <Button 
          onPress={handleSave} 
          className="mt-4" 
          disabled={loading}
          style={{ backgroundColor: '#22c55e' }}
        >
          <ButtonText style={{ color: 'white' }}>
            {loading ? 'Salvando...' : (isEditing ? 'Atualizar Time' : 'Salvar Time')}
          </ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
}
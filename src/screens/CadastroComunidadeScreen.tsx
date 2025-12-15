import React, { useState, useEffect } from 'react';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { Button, ButtonText } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form-control';
import { Toast, ToastTitle, useToast } from '@/components/ui/toast';
import { Image } from '@/components/ui/image';
import { useDispatch } from 'react-redux';
import { addComunidade, updateComunidade } from '@/src/store/comunidadesSlice';
import { setCharacters } from '@/src/store/charactersSlice';
import { RootState } from '@/src/store';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FirebaseService } from '@/src/services/firebaseService';
import { AddIcon } from '@/components/ui/icon';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { NotificationService } from '@/src/services/notificationService';
import { useSelector } from 'react-redux';
import { Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator, SelectItem } from '@/components/ui/select';
import { ChevronDownIcon } from '@/components/ui/icon';

export default function CadastroComunidadeScreen() {
  const params = useLocalSearchParams();
  const isEditing = !!params.id;
  
  const [nome, setNome] = useState('');
  const [lider, setLider] = useState('');
  const [gerencia, setGerencia] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const toast = useToast();
  const { items: characters } = useSelector((state: RootState) => state.characters);

  useEffect(() => {
    if (characters.length === 0) {
      fetchCharacters();
    }
    
    if (isEditing && params.id) {
      setNome(String(params.nome || ''));
      setLider(String(params.lider || ''));
      setGerencia(String(params.gerencia || ''));
      setDescricao(String(params.descricao || ''));
      setImageUri(params.imageUri && params.imageUri !== '' ? String(params.imageUri) : null);
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
      console.log('Erro ao carregar equipe:', error);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (nome.length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }
    
    if (!lider.trim()) {
      newErrors.lider = 'Líder é obrigatório';
    } else if (lider.length < 2) {
      newErrors.lider = 'Nome do líder deve ter pelo menos 2 caracteres';
    }
    
    if (!gerencia.trim()) {
      newErrors.gerencia = 'Gerência Responsável é obrigatória';
    } else if (gerencia.length < 2) {
      newErrors.gerencia = 'Gerência deve ter pelo menos 2 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        toast.show({
          placement: 'top',
          render: ({ id }) => (
            <Toast nativeID={id} action="error" variant="accent">
              <ToastTitle>Permissão necessária para acessar galeria</ToastTitle>
            </Toast>
          ),
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setImageUri(result.assets[0].uri);
        
        toast.show({
          placement: 'top',
          render: ({ id }) => (
            <Toast nativeID={id} action="success" variant="accent">
              <ToastTitle>Imagem selecionada!</ToastTitle>
            </Toast>
          ),
        });
      }
    } catch (error) {
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="accent">
            <ToastTitle>Erro ao selecionar imagem</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  const handleSave = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        const comunidadeData = {
          nome,
          liderComunidade: lider,
          gerencia,
          descricao,
          imageUri: imageUri || null,
        };
        
        if (isEditing) {
          await FirebaseService.updateComunidade(params.id as string, comunidadeData);
          
          dispatch(updateComunidade({
            id: params.id as string,
            ...comunidadeData
          }));
          
          toast.show({
            placement: 'top',
            render: ({ id }) => {
              return (
                <Toast nativeID={id} action="success" variant="accent">
                  <ToastTitle>Comunidade atualizada com sucesso!</ToastTitle>
                </Toast>
              );
            },
          });
        } else {
          const firebaseId = await FirebaseService.addComunidade(comunidadeData);
          
          dispatch(addComunidade({
            id: firebaseId,
            ...comunidadeData
          }));
          
          toast.show({
            placement: 'top',
            render: ({ id }) => {
              return (
                <Toast nativeID={id} action="success" variant="accent">
                  <ToastTitle>Comunidade criada com sucesso!</ToastTitle>
                </Toast>
              );
            },
          });
          
          try {
            await NotificationService.sendImmediateNotification(
              'Nova Comunidade!',
              `Comunidade "${nome}" foi criada com sucesso.`
            );
          } catch (error) {
            console.log('Notification error:', error);
          }
        }
        
        router.back();
      } catch (error) {
        toast.show({
          placement: 'top',
          render: ({ id }) => {
            return (
              <Toast nativeID={id} action="error" variant="accent">
                <ToastTitle>Erro ao salvar comunidade</ToastTitle>
              </Toast>
            );
          },
        });
        console.error('Erro ao salvar comunidade:', error);
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
          <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', textAlign: 'center', lineHeight: 36 }}>{isEditing ? 'Editar Comunidade' : 'Nova Comunidade'}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, textAlign: 'center' }}>{isEditing ? 'Atualize os dados da comunidade' : 'Crie uma nova comunidade'}</Text>
        </VStack>
      </LinearGradient>
      
      <VStack className="flex-1 p-4" space="md">
      

      <VStack space="sm">
        <Text className="mb-2 font-semibold">Imagem da Comunidade</Text>
        <Button 
          variant="outline" 
          onPress={pickImage}
          style={{ 
            height: 120, 
            borderStyle: 'dashed', 
            borderWidth: 2,
            borderColor: '#6366f1',
            backgroundColor: imageUri ? 'transparent' : '#f8fafc'
          }}
        >
          {imageUri ? (
            <VStack className="items-center" space="xs">
              <Image 
                source={{ uri: imageUri }} 
                style={{ width: 80, height: 80, borderRadius: 8 }}
                alt="Imagem da comunidade"
              />
              <Text className="text-xs text-gray-600">Toque para alterar</Text>
            </VStack>
          ) : (
            <VStack className="items-center" space="xs">
              <AddIcon size="xl" color="#6366f1" />
              <Text className="text-sm font-medium" style={{ color: '#6366f1' }}>Toque para selecionar imagem</Text>
              <Text className="text-xs text-gray-500">Formatos: JPG, PNG</Text>
            </VStack>
          )}
        </Button>
      </VStack>
      
      <FormControl isInvalid={!!errors.nome}>
        <Text className="mb-2">Nome da Comunidade</Text>
        <Input>
          <InputField
            value={nome}
            onChangeText={setNome}
            placeholder="Digite o nome da comunidade"
            editable={true}
            selectTextOnFocus={true}
            clearButtonMode="while-editing"
          />
        </Input>
        {errors.nome && <Text style={{ color: 'red', fontSize: 14, marginTop: 4 }}>{errors.nome}</Text>}
      </FormControl>

      <FormControl isInvalid={!!errors.lider}>
        <Text className="mb-2">Líder da Comunidade</Text>
        <Select selectedValue={lider} onValueChange={setLider}>
          <SelectTrigger variant="outline" size="md">
            <SelectInput placeholder="Selecione um membro da equipe" />
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
        {errors.lider && <Text style={{ color: 'red', fontSize: 14, marginTop: 4 }}>{errors.lider}</Text>}
      </FormControl>

      <FormControl isInvalid={!!errors.gerencia}>
        <Text className="mb-2">Gerência Responsável</Text>
        <Input>
          <InputField
            value={gerencia}
            onChangeText={setGerencia}
            placeholder="Digite a gerência responsável"
            editable={true}
            selectTextOnFocus={true}
            clearButtonMode="while-editing"
          />
        </Input>
        {errors.gerencia && <Text style={{ color: 'red', fontSize: 14, marginTop: 4 }}>{errors.gerencia}</Text>}
      </FormControl>

      <FormControl>
        <Text className="mb-2">Descrição</Text>
        <Textarea>
          <TextareaInput
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Digite uma descrição para a comunidade (opcional)"
            numberOfLines={4}
            multiline={true}
            textAlignVertical="top"
          />
        </Textarea>
      </FormControl>

      <Button 
        onPress={handleSave} 
        className="mt-4" 
        disabled={loading}
        style={{ backgroundColor: '#22c55e' }}
      >
        <ButtonText style={{ color: 'white' }}>
          {loading ? 'Salvando...' : (isEditing ? 'Atualizar Comunidade' : 'Salvar Comunidade')}
        </ButtonText>
      </Button>
      </VStack>
    </VStack>
  );
}
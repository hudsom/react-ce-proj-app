import React, { useEffect } from 'react';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { FlatList } from '@/components/ui/flat-list';
import { Image } from '@/components/ui/image';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../src/store';
import { setLoading, setCharacters, setError } from '../src/store/charactersSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import BottomTabBar from '../src/components/BottomTabBar';
import { gql } from '@apollo/client';
import { apolloClient } from '../src/services/apolloClient';

export default function EquipeScreen() {
  const { items: characters, loading } = useSelector((state: RootState) => state.characters);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const GET_CHARACTERS = gql`
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
  `;

  useEffect(() => {
    const fetchCharacters = async () => {
      dispatch(setLoading(true));
      try {
        const result = await apolloClient.query({
          query: GET_CHARACTERS,
        });
        if (result.data?.characters?.results) {
          dispatch(setCharacters(result.data.characters.results));
        }
      } catch (error: any) {
        dispatch(setError(error.message));
      } finally {
        dispatch(setLoading(false));
      }
    };
    
    fetchCharacters();
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Alive': return '#22c55e';
      case 'Dead': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderCharacter = ({ item }: any) => (
    <Card className="m-2 p-4">
      <HStack space="md" className="items-center">
        <Image 
          source={{ uri: item.image }} 
          style={{ width: 60, height: 60, borderRadius: 30 }}
          alt={item.name}
        />
        <VStack space="xs" className="flex-1">
          <Text className="font-bold text-lg">{item.name}</Text>
          <HStack space="sm" className="items-center">
            <Text 
              style={{ 
                color: getStatusColor(item.status),
                fontWeight: '600',
                fontSize: 12
              }}
            >
              ● {item.status}
            </Text>
            <Text className="text-sm text-gray-600">{item.species}</Text>
          </HStack>
          <Text className="text-sm text-gray-500">📍 {item.location.name}</Text>
        </VStack>
      </HStack>
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
        }}
      >
        <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', textAlign: 'center', lineHeight: 36 }}>
          Equipe
        </Text>
      </LinearGradient>
      
      <VStack className="flex-1 p-4">
        {loading ? (
          <Text className="text-center mt-8">Carregando equipe...</Text>
        ) : (
          <FlatList
            data={characters}
            renderItem={renderCharacter}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </VStack>
      
      <BottomTabBar activeTab="equipe" />
    </VStack>
  );
}
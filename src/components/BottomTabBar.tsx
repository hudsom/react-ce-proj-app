import React from 'react';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { clearAuth } from '@/src/store/authSlice';
import { AuthService } from '@/src/services/authService';
import { MaterialIcons } from '@expo/vector-icons';

interface TabItem {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
}

interface BottomTabBarProps {
  activeTab?: string;
}

export default function BottomTabBar({ activeTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await AuthService.logout();
    dispatch(clearAuth());
    router.replace('/login');
  };

  const tabs: TabItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: 'home',
      onPress: () => router.push('/home'),
    },
    {
      id: 'comunidades',
      label: 'Comunidades',
      icon: 'groups',
      onPress: () => router.push('/comunidades'),
    },
    {
      id: 'times',
      label: 'Times',
      icon: 'flash-on',
      onPress: () => router.push('/times'),
    },
    {
      id: 'equipe',
      label: 'Equipe',
      icon: 'people',
      onPress: () => router.push('/equipe'),
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: 'logout',
      onPress: handleLogout,
    },
  ];

  return (
    <HStack
      className="bg-background-0 border-t border-outline-200"
      style={{
        paddingBottom: insets.bottom + 8,
        paddingTop: 12,
        paddingHorizontal: 16,
        justifyContent: 'space-around',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <Pressable
            key={tab.id}
            onPress={tab.onPress}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 8,
            }}
          >
            <VStack className="items-center" space="xs">
              <MaterialIcons 
                name={tab.icon as any}
                size={20}
                color={isActive ? '#6366f1' : '#6b7280'}
                style={{ opacity: isActive ? 1 : 0.6 }}
              />
              <Text
                className="text-xs"
                style={{
                  color: isActive ? '#6366f1' : '#6b7280',
                  fontWeight: isActive ? '600' : '400',
                }}
              >
                {tab.label}
              </Text>
              {isActive && (
                <VStack
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: '#6366f1',
                    marginTop: 2,
                  }}
                />
              )}
            </VStack>
          </Pressable>
        );
      })}
    </HStack>
  );
}
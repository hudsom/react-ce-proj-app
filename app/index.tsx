import React, { useEffect } from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Box className="flex-1 justify-center items-center">
      <Text>Redirecionando...</Text>
    </Box>
  );
}
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import CustomButton from '../components/CustomButton';
import { getData, storeData } from '../utils/storage';
import { getDaysDiffWithoutHours } from '../utils/utils';
import NumberInputModal from '@/components/NumberInputModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const [balance, setBalance] = useState<number>(0);
  const [dailyWage, setDailyWage] = useState<{ value: number; date: string } | null>(null);
  const [showWageModal, setShowWageModal] = useState<boolean>(false);
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
  const [showBalanceModal, setShowBalanceModal] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedBalance = await getData('balance');
        const storedWage = await getData('dailyWage');
        const today = new Date();

        if (storedBalance !== null) {
          setBalance(storedBalance);
        }

        if (storedWage) {
          const dailyWageDate = new Date(storedWage.date);
          const diffDays = getDaysDiffWithoutHours(today, dailyWageDate);
          const updatedWage = { ...storedWage, date: today.toISOString() };
          await storeData('dailyWage', updatedWage);

          if (diffDays > 0) {
            setBalance(prev => prev + storedWage.value * diffDays);
          }
          setDailyWage(updatedWage);
        }
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      }
    };
    loadData();
  }, []);

  // Guardar balance automáticamente
  useEffect(() => {
    const saveBalance = async () => {
      try {
        await storeData('balance', balance);
      } catch (error) {
        console.error('Error al guardar el balance:', error);
      }
    };
    saveBalance();
  }, [balance]);

  // Guardar dailyWage automáticamente
  useEffect(() => {
    const saveDailyWage = async () => {
      if (dailyWage) {
        try {
          await storeData('dailyWage', dailyWage);
        } catch (error) {
          console.error('Error al guardar la paga diaria:', error);
        }
      }
    };
    saveDailyWage();
  }, [dailyWage]);

  // Método que elimina todos los datos
  const deleteAllData = async () => {
    try {
      await AsyncStorage.clear();
      setBalance(0);
      setDailyWage(null);
      Alert.alert('Datos borrados', 'Todos los datos han sido eliminados.');
    } catch (error) {
      console.error('Error al borrar datos:', error);
      Alert.alert('Error', 'No se pudieron borrar los datos.');
    }
  };

  // Función que se dispara al hacer long press
  const handleLongPress = () => {
    Alert.alert(
      'Confirmar borrado',
      '¿Estás seguro de borrar todos los datos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar', style: 'destructive', onPress: deleteAllData }
      ]
    );
  };

  const handleBalancePress = () => {
    setShowBalanceModal(true);
  };

  return (
    <View style={styles.container}>
      {/* Cabecera */}
      <View style={styles.header}>
        <Text style={styles.headerText1}>DinDin</Text>
        <Text style={styles.headerText2}>Diario</Text>
      </View>

      {/* Saldo disponible */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>Saldo disponible</Text>
        <Text
          style={styles.balanceText}
          onPress={handleBalancePress} 
          onLongPress={handleLongPress}
        >
          {balance}€
        </Text>
        {dailyWage && (
          <Text style={styles.balanceSubInfo}>Paga diaria: {`+${dailyWage.value}`}€</Text>
        )}
      </View>

      {/* Botones */}
      <View style={styles.buttonsSection}>
        <CustomButton
          title="Añadir paga diaria"
          color="#f0b801"
          textColor="#000"
          onPress={() => setShowWageModal(true)}
        />
        <CustomButton
          title="Añadir gasto manual"
          color="#f1d49a"
          textColor="#000"
          onPress={() => setShowExpenseModal(true)}
        />
      </View>

      {/* Modales */}
      <NumberInputModal<{ value: number; date: string }>
        visible={showWageModal}
        title="Establecer paga diaria"
        placeholder="Ingresa la paga diaria"
        initialValue={dailyWage ? dailyWage.value.toString() : ''}
        transform={(value) => ({ value, date: new Date().toISOString() })}
        onConfirm={(newWage) => {
          Alert.alert(
            'Añadir paga diaria',
            `¿Quieres añadir ${newWage.value}€ a tu saldo de hoy?`,
            [
              { text: 'No', onPress: () => { }, style: 'cancel' },
              { text: 'Sí', onPress: () => setBalance(prev => prev + newWage.value) }
            ]
          );
          setDailyWage(newWage);
          setShowWageModal(false);
        }}
        onCancel={() => setShowWageModal(false)}
      />

      <NumberInputModal
        visible={showExpenseModal}
        title="Añadir gasto manual"
        placeholder="Ingresa el gasto"
        initialValue=""
        onConfirm={(expense: number) => {
          setBalance(prev => prev - expense);
          setShowExpenseModal(false);
        }}
        onCancel={() => setShowExpenseModal(false)}
      />

      {/* Modal para editar el balance */}
      <NumberInputModal
        visible={showBalanceModal}
        title="Editar saldo"
        placeholder="Ingresa el nuevo saldo"
        initialValue={balance.toString()}
        onConfirm={(newBalance: number) => {
          setBalance(newBalance);
          setShowBalanceModal(false);
        }}
        onCancel={() => setShowBalanceModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1d49a',
    width: '100%',
    justifyContent: 'space-between',
    position: 'relative',
  },
  header: {
    zIndex: 0,
    display: 'flex',
    backgroundColor: '#ea3a22',
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(88, 24, 16, 0.5)',
  },
  headerText1: {
    fontFamily: 'FuturaBold',
    fontSize: 60,
  },
  headerText2: {
    fontFamily: 'FuturaBold',
    fontSize: 60,
  },
  balanceSection: {
    paddingVertical: 30,
    alignItems: 'center',
    width: '100%',
  },
  balanceLabel: {
    fontSize: 18,
    color: '#2d88c3',
    marginTop: 10,
    fontFamily: 'FuturaBold',
  },
  balanceText: {
    fontSize: 100,
    fontWeight: '900',
    color: '#000',
    fontFamily: 'FuturaBold',
  },
  balanceSubInfo: {
    fontSize: 18,
    color: '#2d88c3',
    marginTop: 10,
  },
  buttonsSection: {
    backgroundColor: '#2985a0',
    paddingHorizontal: 30,
    paddingVertical: 45,
    width: '100%',
    gap: 12,
    borderTopWidth: 2,
    borderTopColor: 'rgba(27, 82, 98, 0.5)',
  },
});

export default HomeScreen;

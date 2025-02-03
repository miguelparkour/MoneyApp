import React, { useState, useEffect } from 'react';
import { Modal, Text, View, Button, TextInput, StyleSheet } from 'react-native';
import { getData, storeData, removeData } from "./utils/storage";
import { getDaysDiffWithoutHours } from "./utils/utils";

export default function Index() {
  // Estado para llevar el control del balance y la paga diaria
  const [balance, setBalance] = useState(0);
  const [dailyWage, setDailyWage] = useState<{ value: number, date: string } | null>(null);

  // Estados para controlar la visibilidad de los modales
  const [showWageModal, setShowWageModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Estados para almacenar el valor ingresado en cada modal
  const [inputWage, setInputWage] = useState('');
  const [inputExpense, setInputExpense] = useState('');

  // Al iniciar, cargamos el valor de dailyWage desde AsyncStorage
  useEffect(() => {
    const loadDailyWage = async () => {
      try {
        const storedWage = await getData('dailyWage');
        if (storedWage !== null) {
          setDailyWage(storedWage);
        } else {
        }
      } catch (error) {
        console.error('Error al cargar la paga diaria:', error);
      }
    };
    const loadBalance = async () => {
      try {
        const storedBalance = await getData('balance');
        if (storedBalance !== null) {
          setBalance(storedBalance);
        } else {
        }
      } catch (error) {
        console.error('Error al cargar el balance:', error);
      }
    };

    loadBalance();
    loadDailyWage();
  }, []);

  // cada vez que se actualice el balance, lo guardamos en AsyncStorage
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

  // Función para abrir el modal de paga diaria, inicializando el valor actual
  const handleOpenWageModal = () => {
    setInputWage(dailyWage ? dailyWage.value.toString() : '');
    setShowWageModal(true);
  };

  // Función para confirmar la paga diaria y guardarla en AsyncStorage
  const handleConfirmWage = async () => {
    const parsedWage = parseFloat(inputWage);
    if (!isNaN(parsedWage)) {
      setDailyWage({ value: parsedWage, date: new Date().toISOString() });
      // Al confirmar, se suma el valor ingresado al balance sólo si no había valor en el dailyWage del storage
      try {
        const daylyWage = await getData('dailyWage');
        console.log('daylyWage', daylyWage);
        if (!daylyWage) {
          setBalance(prevBalance => prevBalance + parsedWage);
        } else {
          // cargamos el valor en la DailyWage
          setDailyWage({ value: daylyWage.value, date: daylyWage.date });

          // calculamos si tenemos que añadir valor al balance (si estamos en un día diferente al que se guardó la DailyWage * el numero de días)
          const today = new Date();
          const dailyWageDate = new Date(daylyWage.date);
          const diffDays = getDaysDiffWithoutHours(today, dailyWageDate);

          if (diffDays > 0) {
            setBalance(prevBalance => prevBalance + parsedWage * diffDays);
          }
        }
      } catch (error) {
        console.error('Error al cargar la paga diaria:', error);
      }
      try {
        await storeData('dailyWage', {value: parsedWage, date: new Date()});
      } catch (error) {
        console.error('Error al guardar la paga diaria:', error);
      }
      setShowWageModal(false);
    } else {
      alert('Por favor ingresa un número válido.');
    }
  };

  // Función para abrir el modal de gasto manual
  const handleOpenExpenseModal = () => {
    setInputExpense('');
    setShowExpenseModal(true);
  };

  // Función para confirmar el gasto manual
  const handleConfirmExpense = () => {
    const parsedExpense = parseFloat(inputExpense);
    if (!isNaN(parsedExpense)) {
      // Se resta el gasto del balance
      setBalance(prevBalance => prevBalance - parsedExpense);
      setShowExpenseModal(false);
    } else {
      alert('Por favor ingresa un número válido.');
    }
  };

  function testMethod(): void {
    // en este método vamos a restarle un día a la fecha de la DailyWage y guardarla en el storage
    // cargamos la DailyWage
    getData('dailyWage').then((dailyWage) => {
      // calculamos si tenemos que añadir valor al balance (si estamos en un día diferente al que se guardó la DailyWage * el numero de días)
      const today = new Date();
      const dailyWageDate = new Date(dailyWage.date);
      const diffDays = Math.ceil((today.getTime() - dailyWageDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        setBalance(prevBalance => prevBalance + dailyWage.value * diffDays);
      }
      // restamos un día a la fecha de la DailyWage
      dailyWageDate.setDate(dailyWageDate.getDate() - 1);
      // guardamos la nueva fecha
      storeData('dailyWage', {value: dailyWage.value, date: dailyWageDate});
    });
  }

  function testMethod2(): void {
    // en este método vamos a borrar la DailyWage y poner el balance a 0
    removeData('dailyWage');
    setBalance(0);

  }
  
  return (
    <View style={styles.container}>
      {/* Sección central para mostrar el balance */}
      <View style={styles.balanceContainer}>
        <Text onPress={() => testMethod2()} style={styles.balanceText}>{balance}€</Text>
      </View>

      {/* Botones para abrir los modales */}
      <View style={styles.buttonsContainer}>
        <Button title="Añadir paga diaria" onPress={handleOpenWageModal} />
        <View style={{ height: 20 }} />
        <Button title="Añadir gasto manual" onPress={handleOpenExpenseModal} />
      </View>

      {/* Modal para establecer la paga diaria */}
      <Modal visible={showWageModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Establecer paga diaria</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ingresa la paga diaria"
              value={inputWage}
              onChangeText={setInputWage}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setShowWageModal(false)} />
              <Button title="Confirmar" onPress={handleConfirmWage} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para ingresar un gasto manual */}
      <Modal visible={showExpenseModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Añadir gasto manual</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ingresa el gasto"
              value={inputExpense}
              onChangeText={setInputExpense}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setShowExpenseModal(false)} />
              <Button title="Confirmar" onPress={handleConfirmExpense} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  balanceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

// /src/components/NumberInputModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Modal } from 'react-native';
import ModalWrapper from './ModalWrapper';
import CustomButton from './CustomButton';

interface NumberInputModalProps<T> {
  visible: boolean;
  title: string;
  placeholder: string;
  initialValue?: string;
  onConfirm: (result: T) => void;
  onCancel: () => void;
  /**
   * Función para transformar el número ingresado en el valor que se necesita.
   * Si no se provee, se asume que se quiere el número directamente.
   */
  transform?: (value: number) => T;
}

const NumberInputModal = <T extends unknown>({
  visible,
  title,
  placeholder,
  initialValue = '',
  onConfirm,
  onCancel,
  transform,
}: NumberInputModalProps<T>) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const inputRef = useRef<TextInput>(null);
  const [selectOnFocus, setSelectOnFocus] = useState(false);

  useEffect(() => {
    if (visible) {
      setInputValue(initialValue);
      // Pequeño delay para asegurarse de que el modal y el input están montados
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // prueba con 300ms
    }
  }, [visible, initialValue]);
  

  const handleConfirm = () => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      if (transform) {
        onConfirm(transform(parsed));
      } else {
        // Se asume que T es number en este caso
        onConfirm(parsed as unknown as T);
      }
    } else {
      confirm('Por favor ingresa un número válido.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      {/* Overlay semitransparente */}
      <View style={styles.overlay}>
        {/* Contenedor del contenido del modal */}
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            keyboardType="numeric"
            placeholder={placeholder}
            value={inputValue}
            onChangeText={setInputValue}
            selectTextOnFocus={true} // SIEMPRE selecciona al hacer focus
          />
          <View style={styles.modalButtons}>
            {/* Usa tu CustomButton con la misma apariencia que en la pantalla principal */}
            <CustomButton
              title="Cancelar"
              color="#ea3a22"    // Rojo para cancelar
              textColor="#fff"
              onPress={onCancel}
            />
            <CustomButton
              title="Confirmar"
              color="#f0b801"    // Amarillo para confirmar
              textColor="#000"
              onPress={handleConfirm}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NumberInputModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Oscurece un poco el fondo
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#f1d49a', // Mismo beige que el fondo principal
    padding: 20,
    borderRadius: 10,
    width: '80%',
    borderWidth: 2, // Azul que usas en otras secciones
    // Si usas una fuente personalizada:
    fontFamily: 'FuturaBold' // en texto, se pone a nivel de Text/TextInput
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2985a0', // Azul que usas en otras secciones
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'FuturaBold', // si la tienes configurada
  },
  input: {
    borderWidth: 1,
    borderColor: '#2985a0',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
    color: '#000',
    marginBottom: 20,
    fontSize: 18,
    // fontFamily: 'FuturaBold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

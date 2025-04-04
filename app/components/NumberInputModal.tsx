// /src/components/NumberInputModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import ModalWrapper from './ModalWrapper';

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
      setTimeout(() => {
        inputRef.current?.focus();
        setSelectOnFocus(true);
      }, 200);
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
    <ModalWrapper visible={visible}>
      <Text style={styles.modalTitle}>{title}</Text>
      <TextInput
        ref={inputRef}
        style={styles.input}
        keyboardType="numeric"
        placeholder={placeholder}
        value={inputValue}
        onChangeText={setInputValue}
        selection={
          selectOnFocus && inputValue
            ? { start: 0, end: inputValue.length }
            : undefined
        }
        onFocus={() => setSelectOnFocus(false)}
      />
      <View style={styles.modalButtons}>
        <Button title="Cancelar" onPress={onCancel} />
        <Button title="Confirmar" onPress={handleConfirm} />
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
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

export default NumberInputModal;

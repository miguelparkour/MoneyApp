import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Guarda datos en AsyncStorage.
 * @param key La clave para identificar el dato.
 * @param value El valor a almacenar (convertido a JSON si es un objeto).
 */
export const storeData = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error('Error al guardar datos', error);
  }
};

/**
 * Recupera datos de AsyncStorage.
 * @param key La clave del dato a recuperar.
 * @returns El valor recuperado, parseado desde JSON si aplica.
 */
export const getData = async (key: string): Promise<any | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    console.log('jsonValue', jsonValue);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue); // Convertimos de nuevo a objeto si es necesario
    }
    return null;
  } catch (error) {
    console.error('Error al obtener datos', error);
    return null;
  }
};

/**
 * Elimina datos de AsyncStorage.
 * @param key La clave del dato a eliminar.
 */
export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error al eliminar datos', error);
  }
};

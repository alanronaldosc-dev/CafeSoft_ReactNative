import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Switch,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

import colors from '../theme/colors';

import {
  obtenerEmpleados,
  cambiarEstadoEmpleado,
} from '../services/usuarioService';

export default function GestionEmpleadosScreen() {

  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    try {
      setLoading(true);

      const data = await obtenerEmpleados();

      setEmpleados(data);

    } catch (error) {

      Alert.alert(
        'Error',
        'No fue posible obtener los empleados.'
      );

    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (empleado) => {

    const nuevoEstado = !empleado.activo;

    try {

      // Actualización visual inmediata
      setEmpleados(actuales =>
        actuales.map(item =>
          item.id === empleado.id
            ? { ...item, activo: nuevoEstado }
            : item
        )
      );

      await cambiarEstadoEmpleado(
        empleado.id,
        nuevoEstado
      );

    } catch (error) {

      // Si falla, regresamos al estado anterior
      setEmpleados(actuales =>
        actuales.map(item =>
          item.id === empleado.id
            ? { ...item, activo: empleado.activo }
            : item
        )
      );

      Alert.alert(
        'Error',
        'No fue posible cambiar el estado del empleado.'
      );
    }
  };

  const renderEmpleado = ({ item }) => (
    <View style={styles.card}>

      <View style={styles.info}>

        <Text style={styles.nombre}>
          {item.nombre}
        </Text>

        <Text style={styles.email}>
          {item.email}
        </Text>

        <Text
          style={[
            styles.estado,
            item.activo
              ? styles.activo
              : styles.inactivo
          ]}
        >
          {item.activo ? 'Activo' : 'Inactivo'}
        </Text>

      </View>

      <Switch
        value={Boolean(item.activo)}
        onValueChange={() => cambiarEstado(item)}
      />

    </View>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Cargando empleados...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.header}>

        <Text style={styles.title}>
          Gestión de empleados
        </Text>

        <Text style={styles.subtitle}>
          Activa o desactiva el acceso al punto de venta
        </Text>

      </View>

      <FlatList
        data={empleados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEmpleado}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No hay empleados registrados.
          </Text>
        }
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    padding: 24,
    paddingTop: 50,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textSecondary,
  },

  list: {
    padding: 20,
    paddingTop: 0,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  info: {
    flex: 1,
    marginRight: 15,
  },

  nombre: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },

  email: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },

  estado: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: 'bold',
  },

  activo: {
    color: 'green',
  },

  inactivo: {
    color: 'red',
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
  },

  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.textSecondary,
  },

});

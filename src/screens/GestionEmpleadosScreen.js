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
      console.error(error);

      Alert.alert(
        'Error',
        'No fue posible cargar los empleados.'
      );
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (empleado) => {

    const nuevoEstado = !empleado.activo;

    try {

      // Cambiamos visualmente el switch
      setEmpleados(actuales =>
        actuales.map(item =>
          item.id === empleado.id
            ? {
                ...item,
                activo: nuevoEstado,
              }
            : item
        )
      );

      // Guardamos el cambio en Spring Boot
      await cambiarEstadoEmpleado(
        empleado.id,
        nuevoEstado
      );

    } catch (error) {

      console.error(error);

      // Si falla la API, regresamos al estado anterior
      setEmpleados(actuales =>
        actuales.map(item =>
          item.id === empleado.id
            ? {
                ...item,
                activo: empleado.activo,
              }
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

      <View style={styles.employeeInfo}>

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
              ? styles.estadoActivo
              : styles.estadoInactivo,
          ]}
        >
          {item.activo ? '● Activo' : '● Inactivo'}
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
      <View style={styles.loadingContainer}>

        <ActivityIndicator
          size="large"
          color={colors.secondary}
        />

        <Text style={styles.loadingText}>
          Cargando empleados...
        </Text>

      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* ENCABEZADO */}

      <View style={styles.header}>

        <Text style={styles.title}>
          Gestión de empleados
        </Text>

        <Text style={styles.subtitle}>
          Controla quién tiene acceso al punto de venta
        </Text>

      </View>

      {/* LISTA */}

      <FlatList
        data={empleados}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={renderEmpleado}
        contentContainerStyle={styles.list}

        ListEmptyComponent={
          <View style={styles.emptyContainer}>

            <Text style={styles.emptyIcon}>
              👥
            </Text>

            <Text style={styles.emptyText}>
              No hay empleados registrados.
            </Text>

          </View>
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
    paddingHorizontal: 24,
    paddingTop: 55,
    paddingBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },

  subtitle: {
    marginTop: 7,
    fontSize: 14,
    color: colors.textSecondary,
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
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

  employeeInfo: {
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

  estadoActivo: {
    color: 'green',
  },

  estadoInactivo: {
    color: 'red',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textSecondary,
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: 70,
  },

  emptyIcon: {
    fontSize: 45,
    marginBottom: 10,
  },

  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
  },

});

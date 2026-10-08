import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import { BASE_URL } from "../config/api";


export default function ProveedoresListScreen({ navigation }) {

  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);


  const cargarProveedores = async () => {

    try {

      setCargando(true);

      const respuesta = await fetch(
        `${BASE_URL}/proveedores`
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudieron obtener los proveedores"
        );
      }

      const datos = await respuesta.json();

      setProveedores(
        Array.isArray(datos)
          ? datos
          : []
      );

    } catch (error) {

      console.error(
        "Error cargando proveedores:",
        error
      );

      Alert.alert(
        "Error",
        "No se pudieron cargar los proveedores"
      );

    } finally {

      setCargando(false);

    }
  };


  useEffect(() => {

    cargarProveedores();

    const unsubscribe =
      navigation.addListener(
        "focus",
        cargarProveedores
      );

    return unsubscribe;

  }, [navigation]);


  const darDeBaja = (id) => {

    Alert.alert(
      "Dar de baja",
      "¿Deseas dar de baja a este proveedor?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sí",
          onPress: async () => {

            try {

              const respuesta =
                await fetch(
                  `${BASE_URL}/proveedores/${id}/baja`,
                  {
                    method: "PUT",
                  }
                );

              if (!respuesta.ok) {
                throw new Error(
                  "No se pudo dar de baja"
                );
              }

              Alert.alert(
                "Correcto",
                "Proveedor dado de baja"
              );

              cargarProveedores();

            } catch (error) {

              console.error(error);

              Alert.alert(
                "Error",
                "No se pudo dar de baja al proveedor"
              );
            }
          },
        },
      ]
    );
  };


  const eliminarProveedor = (id) => {

    Alert.alert(
      "Eliminar proveedor",
      "¿Deseas eliminar definitivamente este proveedor?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",

          onPress: async () => {

            try {

              const respuesta =
                await fetch(
                  `${BASE_URL}/proveedores/${id}`,
                  {
                    method: "DELETE",
                  }
                );

              if (!respuesta.ok) {
                throw new Error(
                  "No se pudo eliminar"
                );
              }

              Alert.alert(
                "Correcto",
                "Proveedor eliminado correctamente"
              );

              cargarProveedores();

            } catch (error) {

              console.error(error);

              Alert.alert(
                "Error",
                "No se pudo eliminar el proveedor"
              );
            }
          },
        },
      ]
    );
  };


  const renderProveedor = ({ item }) => (

    <View style={styles.card}>

      <Text style={styles.empresa}>
        🏢 {item.nombreEmpresa}
      </Text>

      <Text style={styles.dato}>
        👤 Contacto: {item.contacto}
      </Text>

      <Text style={styles.dato}>
        📞 Teléfono: {item.telefono}
      </Text>

      <Text style={styles.dato}>
        📦 Insumo:{" "}
        {item.insumoPrincipal || "Sin especificar"}
      </Text>

      <Text style={styles.dato}>
        📍 Dirección: {item.direccion}
      </Text>


      <View style={styles.botones}>

        <TouchableOpacity
          style={styles.botonBaja}
          onPress={() =>
            darDeBaja(item.id)
          }
        >

          <Text style={styles.textoBoton}>
            Dar de baja
          </Text>

        </TouchableOpacity>


        <TouchableOpacity
          style={styles.botonEliminar}
          onPress={() =>
            eliminarProveedor(item.id)
          }
        >

          <Text style={styles.textoBoton}>
            Eliminar
          </Text>

        </TouchableOpacity>

      </View>

    </View>
  );


  if (cargando) {

    return (

      <View style={styles.cargando}>

        <ActivityIndicator size="large" />

        <Text>
          Cargando proveedores...
        </Text>

      </View>
    );
  }


  return (

    <View style={styles.container}>

      <View style={styles.header}>

        <View>

          <Text style={styles.titulo}>
            🚚 Proveedores
          </Text>

          <Text style={styles.subtitulo}>
            Catálogo de proveedores
          </Text>

        </View>


        <TouchableOpacity
          style={styles.botonNuevo}
          onPress={() =>
            navigation.navigate(
              "ProveedorForm"
            )
          }
        >

          <Text style={styles.textoBoton}>
            + Nuevo
          </Text>

        </TouchableOpacity>

      </View>


      {proveedores.length === 0 ? (

        <View style={styles.vacio}>

          <Text style={styles.vacioTexto}>
            No hay proveedores registrados.
          </Text>

        </View>

      ) : (

        <FlatList
          data={proveedores}
          keyExtractor={(item) =>
            String(item.id)
          }
          renderItem={renderProveedor}
          contentContainerStyle={{
            paddingBottom: 30,
          }}
        />

      )}

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  titulo: {
    fontSize: 25,
    fontWeight: "bold",
  },

  subtitulo: {
    fontSize: 14,
    marginTop: 3,
  },

  botonNuevo: {
    backgroundColor: "#222",
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 17,
    marginBottom: 14,
    elevation: 3,
  },

  empresa: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 12,
  },

  dato: {
    fontSize: 14,
    marginBottom: 7,
  },

  botones: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  botonBaja: {
    flex: 1,
    backgroundColor: "#d97706",
    padding: 11,
    borderRadius: 9,
    alignItems: "center",
  },

  botonEliminar: {
    flex: 1,
    backgroundColor: "#dc2626",
    padding: 11,
    borderRadius: 9,
    alignItems: "center",
  },

  textoBoton: {
    color: "#ffffff",
    fontWeight: "bold",
  },

  cargando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  vacio: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  vacioTexto: {
    fontSize: 16,
  },

});
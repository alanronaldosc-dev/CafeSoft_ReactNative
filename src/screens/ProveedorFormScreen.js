import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";

import { BASE_URL } from "../config/api";


export default function ProveedorFormScreen({
  navigation,
}) {

  const [nombreEmpresa, setNombreEmpresa] =
    useState("");

  const [contacto, setContacto] =
    useState("");

  const [telefono, setTelefono] =
    useState("");

  const [
    insumoPrincipal,
    setInsumoPrincipal,
  ] = useState("");

  const [direccion, setDireccion] =
    useState("");

  const [guardando, setGuardando] =
    useState(false);


  const guardarProveedor = async () => {

    if (
      !nombreEmpresa.trim() ||
      !contacto.trim() ||
      !telefono.trim() ||
      !direccion.trim()
    ) {

      Alert.alert(
        "Campos incompletos",
        "Completa los campos obligatorios"
      );

      return;
    }


    if (telefono.length !== 10) {

      Alert.alert(
        "Teléfono inválido",
        "El teléfono debe tener 10 dígitos"
      );

      return;
    }


    try {

      setGuardando(true);

      const respuesta =
        await fetch(
          `${BASE_URL}/proveedores`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              nombreEmpresa,
              contacto,
              telefono,
              insumoPrincipal,
              direccion,
            }),
          }
        );


      if (!respuesta.ok) {

        const error =
          await respuesta.text();

        throw new Error(error);
      }


      Alert.alert(
        "Proveedor registrado",
        "El proveedor fue registrado correctamente",
        [
          {
            text: "Aceptar",

            onPress: () =>
              navigation.goBack(),
          },
        ]
      );


    } catch (error) {

      console.error(
        "Error registrando proveedor:",
        error
      );

      Alert.alert(
        "Error",
        "No se pudo registrar el proveedor"
      );


    } finally {

      setGuardando(false);

    }
  };


  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
    >

      <Text style={styles.titulo}>
        🚚 Registrar proveedor
      </Text>

      <Text style={styles.subtitulo}>
        Ingresa los datos del proveedor
      </Text>


      <Text style={styles.label}>
        Nombre de la empresa *
      </Text>

      <TextInput
        style={styles.input}
        value={nombreEmpresa}
        onChangeText={setNombreEmpresa}
        placeholder="Distribuidora Toluca"
      />


      <Text style={styles.label}>
        Persona de contacto *
      </Text>

      <TextInput
        style={styles.input}
        value={contacto}
        onChangeText={setContacto}
        placeholder="Juan Pérez"
      />


      <Text style={styles.label}>
        Teléfono *
      </Text>

      <TextInput
        style={styles.input}
        value={telefono}
        onChangeText={setTelefono}
        placeholder="7221234567"
        keyboardType="numeric"
        maxLength={10}
      />


      <Text style={styles.label}>
        Insumo principal
      </Text>

      <TextInput
        style={styles.input}
        value={insumoPrincipal}
        onChangeText={setInsumoPrincipal}
        placeholder="Café en grano"
      />


      <Text style={styles.label}>
        Dirección *
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.textArea,
        ]}
        value={direccion}
        onChangeText={setDireccion}
        placeholder="Dirección del proveedor"
        multiline
        numberOfLines={4}
      />


      <TouchableOpacity
        style={[
          styles.botonGuardar,

          guardando && {
            opacity: 0.6,
          },
        ]}
        onPress={guardarProveedor}
        disabled={guardando}
      >

        <Text style={styles.textoBoton}>

          {guardando
            ? "Guardando..."
            : "Guardar proveedor"}

        </Text>

      </TouchableOpacity>


      <TouchableOpacity
        style={styles.botonCancelar}
        onPress={() =>
          navigation.goBack()
        }
      >

        <Text style={styles.textoCancelar}>
          Cancelar
        </Text>

      </TouchableOpacity>

    </ScrollView>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },

  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 10,
  },

  subtitulo: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 25,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 7,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },

  textArea: {
    height: 100,
    textAlignVertical: "top",
  },

  botonGuardar: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 25,
  },

  textoBoton: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },

  botonCancelar: {
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },

  textoCancelar: {
    fontSize: 15,
  },

});
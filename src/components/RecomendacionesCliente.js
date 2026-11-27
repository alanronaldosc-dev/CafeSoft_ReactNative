import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View, TouchableOpacity, StyleSheet } from "react-native";
import api from "../config/api";

export default function RecomendacionesCliente({ clienteId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actualizar, setActualizar] = useState(0);
  useEffect(() => {
    let vigente = true;
    if (!clienteId) { setItems([]); return; }
    setLoading(true); setError("");
    api.get(`/analitica/recomendaciones/${clienteId}`, { params: { limite: 5 } })
      .then(({ data }) => { if (vigente) setItems(Array.isArray(data) ? data : []); })
      .catch(() => { if (vigente) setError("No fue posible consultar recomendaciones."); })
      .finally(() => { if (vigente) setLoading(false); });
    return () => { vigente = false; };
  }, [clienteId, actualizar]);
  if (!clienteId) return null;
  return <View style={styles.card}>
    <Text style={styles.title}>💡 Recomendaciones para este cliente</Text>
    {loading ? <ActivityIndicator /> : error ? <Text style={styles.error}>{error}</Text> : items.length ? items.map(p =>
      <View key={p.productoId} style={styles.item}><Text style={styles.name}>{p.nombre}</Text><Text>${Number(p.precio||0).toFixed(2)} · {p.motivo}</Text></View>
    ) : <Text>No hay historial suficiente para recomendar productos.</Text>}
    <TouchableOpacity onPress={() => setActualizar(n=>n+1)}><Text style={styles.link}>↻ Actualizar recomendaciones</Text></TouchableOpacity>
  </View>;
}
const styles = StyleSheet.create({card:{backgroundColor:"#eff8ff",padding:14,borderRadius:12,marginVertical:12},title:{fontWeight:"bold",fontSize:15,color:"#17375b",marginBottom:8},item:{paddingVertical:7,borderBottomWidth:1,borderBottomColor:"#dce8f1"},name:{fontWeight:"600"},error:{color:"#a11"},link:{color:"#0066a4",marginTop:12,fontWeight:"600"}});

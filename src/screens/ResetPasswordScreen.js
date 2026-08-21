import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';

const ResetPasswordScreen = ({ navigation, route }) => {

    const email = route?.params?.email || '';

    const [codigo, setCodigo] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {

        if (!codigo.trim()) {
            Alert.alert(
                'Código requerido',
                'Ingresa el código de recuperación que recibiste.'
            );
            return;
        }

        if (codigo.trim().length !== 6) {
            Alert.alert(
                'Código inválido',
                'El código debe tener 6 dígitos.'
            );
            return;
        }

        if (!password) {
            Alert.alert(
                'Contraseña requerida',
                'Ingresa una nueva contraseña.'
            );
            return;
        }

        if (password.length < 8) {
            Alert.alert(
                'Contraseña inválida',
                'La contraseña debe tener al menos 8 caracteres.'
            );
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert(
                'Las contraseñas no coinciden',
                'Verifica que ambas contraseñas sean iguales.'
            );
            return;
        }

        try {
            setLoading(true);

            /*
             * TODO:
             * Aquí conectaremos el endpoint del backend.
             *
             * Ejemplo:
             *
             * await UsuarioService.restablecerPassword({
             *     email,
             *     codigo,
             *     password
             * });
             */

            // Temporalmente simulamos el cambio exitoso.

            Alert.alert(
                'Contraseña actualizada',
                'Tu contraseña se actualizó correctamente.',
                [
                    {
                        text: 'Iniciar sesión',
                        onPress: () => {
                            navigation.navigate('Login');
                        },
                    },
                ]
            );

        } catch (error) {
            Alert.alert(
                'Error',
                error?.message ||
                    'No fue posible restablecer la contraseña.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.card}>

                    <Text style={styles.icon}>🔑</Text>

                    <Text style={styles.title}>
                        Restablecer contraseña
                    </Text>

                    <Text style={styles.description}>
                        Ingresa el código enviado a:
                    </Text>

                    <Text style={styles.email}>
                        {email}
                    </Text>

                    {/* CÓDIGO */}

                    <Text style={styles.label}>
                        Código de recuperación
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="123456"
                        placeholderTextColor="#999"
                        value={codigo}
                        onChangeText={(text) => {
                            const soloNumeros = text.replace(
                                /[^0-9]/g,
                                ''
                            );

                            setCodigo(soloNumeros.slice(0, 6));
                        }}
                        keyboardType="number-pad"
                        maxLength={6}
                        editable={!loading}
                    />

                    {/* NUEVA CONTRASEÑA */}

                    <Text style={styles.label}>
                        Nueva contraseña
                    </Text>

                    <View style={styles.passwordContainer}>

                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Mínimo 8 caracteres"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!mostrarPassword}
                            autoCapitalize="none"
                            editable={!loading}
                        />

                        <TouchableOpacity
                            onPress={() =>
                                setMostrarPassword(!mostrarPassword)
                            }
                        >
                            <Text style={styles.showText}>
                                {mostrarPassword ? 'Ocultar' : 'Ver'}
                            </Text>
                        </TouchableOpacity>

                    </View>

                    {/* CONFIRMAR CONTRASEÑA */}

                    <Text style={styles.label}>
                        Confirmar contraseña
                    </Text>

                    <View style={styles.passwordContainer}>

                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Repite tu contraseña"
                            placeholderTextColor="#999"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!mostrarConfirmacion}
                            autoCapitalize="none"
                            editable={!loading}
                        />

                        <TouchableOpacity
                            onPress={() =>
                                setMostrarConfirmacion(
                                    !mostrarConfirmacion
                                )
                            }
                        >
                            <Text style={styles.showText}>
                                {mostrarConfirmacion
                                    ? 'Ocultar'
                                    : 'Ver'}
                            </Text>
                        </TouchableOpacity>

                    </View>

                    {/* BOTÓN */}

                    <TouchableOpacity
                        style={[
                            styles.button,
                            loading && styles.buttonDisabled,
                        ]}
                        onPress={handleResetPassword}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading
                                ? 'Actualizando...'
                                : 'Restablecer contraseña'}
                        </Text>
                    </TouchableOpacity>

                    {/* REGRESAR */}

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        disabled={loading}
                    >
                        <Text style={styles.backButtonText}>
                            ← Regresar
                        </Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F8F5F1',
    },

    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 25,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },

    icon: {
        fontSize: 48,
        textAlign: 'center',
        marginBottom: 15,
    },

    title: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#4E342E',
        textAlign: 'center',
        marginBottom: 12,
    },

    description: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        marginBottom: 4,
    },

    email: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#6F4E37',
        textAlign: 'center',
        marginBottom: 25,
    },

    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4E342E',
        marginBottom: 8,
        marginTop: 8,
    },

    input: {
        height: 52,
        borderWidth: 1,
        borderColor: '#D7CCC8',
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#FAFAFA',
        marginBottom: 10,
    },

    passwordContainer: {
        height: 52,
        borderWidth: 1,
        borderColor: '#D7CCC8',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        marginBottom: 10,
    },

    passwordInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
    },

    showText: {
        color: '#6F4E37',
        fontWeight: '600',
        marginRight: 15,
    },

    button: {
        height: 52,
        backgroundColor: '#6F4E37',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },

    buttonDisabled: {
        opacity: 0.6,
    },

    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },

    backButton: {
        marginTop: 20,
        alignItems: 'center',
    },

    backButtonText: {
        color: '#6F4E37',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ResetPasswordScreen;

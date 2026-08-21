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

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleContinue = async () => {
        if (!email.trim()) {
            Alert.alert('Campo obligatorio', 'Ingresa tu correo electrónico.');
            return;
        }

        const emailLimpio = email.trim().toLowerCase();

        if (!/\S+@\S+\.\S+/.test(emailLimpio)) {
            Alert.alert(
                'Correo inválido',
                'Ingresa un correo electrónico válido.'
            );
            return;
        }

        try {
            setLoading(true);

            /*
             * TODO:
             * Aquí conectaremos el endpoint del backend
             * para solicitar el código de recuperación.
             *
             * Ejemplo:
             *
             * await UsuarioService.solicitarRecuperacion(emailLimpio);
             */

            // Temporalmente simulamos que el correo fue aceptado.
            navigation.navigate('ResetPassword', {
                email: emailLimpio,
            });

        } catch (error) {
            Alert.alert(
                'Error',
                error?.message || 'No fue posible iniciar la recuperación.'
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

                    <Text style={styles.icon}>🔐</Text>

                    <Text style={styles.title}>
                        ¿Olvidaste tu contraseña?
                    </Text>

                    <Text style={styles.description}>
                        Ingresa el correo electrónico asociado a tu cuenta y
                        te ayudaremos a recuperar el acceso.
                    </Text>

                    <Text style={styles.label}>
                        Correo electrónico
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="ejemplo@gmail.com"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                    />

                    <TouchableOpacity
                        style={[
                            styles.button,
                            loading && styles.buttonDisabled,
                        ]}
                        onPress={handleContinue}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Procesando...' : 'Continuar'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        disabled={loading}
                    >
                        <Text style={styles.backButtonText}>
                            ← Regresar al inicio de sesión
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
        fontSize: 26,
        fontWeight: 'bold',
        color: '#4E342E',
        textAlign: 'center',
        marginBottom: 12,
    },

    description: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
    },

    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4E342E',
        marginBottom: 8,
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
        marginBottom: 20,
    },

    button: {
        height: 52,
        backgroundColor: '#6F4E37',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
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

export default ForgotPasswordScreen;

//COD_A:
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "HX711.h"
#include <AccelStepper.h>
#include <string.h>
#include <esp_wifi.h>
#include <esp_event.h>
#include <nvs_flash.h>
#include <nvs.h>
#include <esp_netif.h>
#include <esp_log.h>
#include <time.h>  // Para NTP
#include <esp_https_server.h>
#include "server_cert.h"
#include "server_key.h"
#include "ca_cert.h"
#include <esp_system.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#define AP_SSID "ESP32_Setup"
#define AP_PASS "12345678"
#define MAX_STA_CONN 4
#define WEBSOCKET_SERVER "ws://localhost:3000"
#define API_BASE_URL "https://localhost.com/api"
#define MOTOR_PIN_1 26
#define MOTOR_PIN_2 25
#define MOTOR_PIN_3 33
#define MOTOR_PIN_4 32
#define HX711_DOUT 4
#define HX711_SCK 2

/* Certificados SSL incrustados en el binario */
extern const unsigned char server_cert_pem_start[] asm("_binary_server_cert_pem_start");
extern const unsigned char server_cert_pem_end[]   asm("_binary_server_cert_pem_end");
extern const unsigned char server_key_pem_start[]  asm("_binary_server_key_pem_start");
extern const unsigned char server_key_pem_end[]    asm("_binary_server_key_pem_end");

//static const char *TAG = "WIFI_AP_STA_SECURE";
//static const char* TAG = "ESP32_FEEDER";
int device_id = -1;

WebSocketsClient webSocket;
HTTPClient http;
HX711 scale;
AccelStepper stepper(AccelStepper::FULL4WIRE, MOTOR_PIN_1, MOTOR_PIN_2, MOTOR_PIN_3, MOTOR_PIN_4);

bool alimentarAhora = false;

struct Racion {
    float cantidad;
    String hora;
};

std::vector<Racion> raciones;

//========================== Bloque Access Point y conexión a Wi-Fi ==========================

/* Guardado de credenciales en NVS cifrada */
static esp_err_t save_credentials_nvs(const char *ssid, const char *pass) {
    nvs_handle_t nvs_handle;
    esp_err_t err = nvs_open("storage", NVS_READWRITE, &nvs_handle);
    if (err != ESP_OK) return err;

    // Intentar borrar credenciales previas (ignorar error si no existen)
    if (nvs_erase_key(nvs_handle, "ssid") != ESP_OK) {
        Serial.println("Clave 'ssid' no encontrada, continuando...");
    }
    if (nvs_erase_key(nvs_handle, "password") != ESP_OK) {
        Serial.println("Clave 'password' no encontrada, continuando...");
    }

    // Guardar credenciales nuevas
    err = nvs_set_str(nvs_handle, "ssid", ssid);
    if (err == ESP_OK)
        err = nvs_set_str(nvs_handle, "password", pass);

    if (err == ESP_OK)
        err = nvs_commit(nvs_handle);

    nvs_close(nvs_handle);
    return err;
}

static esp_err_t read_credentials_nvs(char *ssid_out, size_t ssid_len, char *pass_out, size_t pass_len) {
    nvs_handle_t nvs_handle;
    esp_err_t err = nvs_open("storage", NVS_READONLY, &nvs_handle);
    if (err != ESP_OK) return err;

    err = nvs_get_str(nvs_handle, "ssid", ssid_out, &ssid_len);
    if (err == ESP_ERR_NVS_NOT_FOUND) {
        Serial.println("SSID no encontrado en NVS");
        ssid_out[0] = '\0';  // Devuelve cadena vacía
    }

    err = nvs_get_str(nvs_handle, "password", pass_out, &pass_len);
    if (err == ESP_ERR_NVS_NOT_FOUND) {
        Serial.println("Password no encontrado en NVS");
        pass_out[0] = '\0';  // Devuelve cadena vacía
    }

    nvs_close(nvs_handle);
    return err;
}

static void wifi_init_softap(void) {
    ESP_LOGI(TAG, "Iniciando AP Seguro...");
    Serial.println("Iniciando AP Seguro...");
    esp_netif_create_default_wifi_ap();
    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    wifi_config_t wifi_config = {
        .ap = {
            .ssid = AP_SSID,
            .ssid_len = strlen(AP_SSID),
            .password = AP_PASS,
            .max_connection = MAX_STA_CONN,
            .authmode = WIFI_AUTH_WPA_WPA2_PSK
        },
    };
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_AP));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_AP, &wifi_config));
    ESP_ERROR_CHECK(esp_wifi_start());
    ESP_LOGI(TAG, "AP Iniciado con SSID:%s PASS:%s", AP_SSID, AP_PASS);
    Serial.println("AP Iniciado con SSID: " + String(AP_SSID) + " y Password " + String(AP_PASS));
}

static esp_err_t root_get_handler(httpd_req_t *req) {
    const char resp[] = "<form method='POST' action='/set_credentials'>SSID:<input name='ssid'/><br>Password:<input name='password' type='password'><br><input type='submit'></form>";
    httpd_resp_send(req, resp, strlen(resp));
    return ESP_OK;
}

static esp_err_t credentials_post_handler(httpd_req_t *req) {
    char buf[128] = {0};
    int len = httpd_req_recv(req, buf, req->content_len);
    if (len <= 0) {
        httpd_resp_send_500(req);
        return ESP_FAIL;
    }

    char ssid[32] = {0}, pass[64] = {0};
    sscanf(buf, "ssid=%31[^&]&password=%63s", ssid, pass);

    if (strlen(ssid) == 0 || strlen(pass) == 0) {
        httpd_resp_sendstr(req, "Error en parámetros");
        return ESP_FAIL;
    }

    save_credentials_nvs(ssid, pass);
    ESP_LOGI(TAG, "Credenciales almacenadas: %s - %s", ssid, pass);
    
    httpd_resp_sendstr(req, "Credenciales guardadas. Reiniciando...");

    esp_wifi_stop();
    vTaskDelay(pdMS_TO_TICKS(3000));
    esp_restart(); // Reinicio para conectar STA con credenciales nuevas

    return ESP_OK;
}

static httpd_handle_t start_https_server(void) {
    httpd_ssl_config_t conf = HTTPD_SSL_CONFIG_DEFAULT();
    conf.cacert = server_cert_pem_start;
    conf.cacert_len = server_cert_pem_end - server_cert_pem_start;
    conf.prvtkey = server_key_pem_start;
    conf.prvtkey_len = server_key_pem_end - server_key_pem_start;

    httpd_handle_t server = NULL;
    if (httpd_ssl_start(&server, &conf) == ESP_OK) {
        httpd_uri_t root = {.uri = "/", .method = HTTP_GET, .handler = root_get_handler};
        httpd_uri_t creds_post = {
            .uri = "/set_credentials",
            .method = HTTP_POST,
            .handler = credentials_post_handler
        };
        httpd_register_uri_handler(server, &root);
        httpd_register_uri_handler(server, &creds_post);
    }
    return server;
}

void wifi_init_sta_from_nvs(void) {
    ESP_LOGI(TAG, "Modo STA leyendo de NVS cifrada");
    esp_netif_create_default_wifi_sta();
    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    char ssid[32], pass[64];
    
    if (read_credentials_nvs(ssid, sizeof(ssid), pass, sizeof(pass)) == ESP_OK) {
        if (ssid[0] == '\0' || pass[0] == '\0') {
            Serial.println("Credenciales Wi-Fi vacías, iniciando en modo AP...");
            wifi_init_softap();
            return;
        }
        wifi_config_t wifi_config = {};
        strcpy((char*)wifi_config.sta.ssid, ssid);
        strcpy((char*)wifi_config.sta.password, pass);
        ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
        ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config));
        ESP_ERROR_CHECK(esp_wifi_start());
    } else {
        ESP_LOGI(TAG, "Credenciales no disponibles en NVS");
    }
}

//========================= Fin bloque Access Point y conexión a Wi-Fi ========================

//========================== Bloque operaciones y reconexión a Wi-Fi ==========================

// Configuración de NTP
const char* ntpServer = "pool.ntp.org";
long gmtOffset_sec = -10800; // UTC-3 (Argentina)
int daylightOffset_sec = 0;

// ----- Guardar/Leer `device_id` en NVS -----
void guardarNVSInt(const char* key, int value) {
    nvs_handle_t nvs;
    nvs_open("storage", NVS_READWRITE, &nvs);
    nvs_set_i32(nvs, key, value);
    nvs_commit(nvs);
    nvs_close(nvs);
}

/*int leerNVSInt(const char* key) {
    nvs_handle_t nvs;
    int value = -1;
    esp_err_t err = nvs_open("storage", NVS_READONLY, &nvs);
    if (err != ESP_OK) {
        Serial.printf("Error al abrir NVS para leer %s\n", key);
        return value;
    }

    if (nvs_get_i32(nvs, key, &value) != ESP_OK) {
        Serial.printf("Clave %s no encontrada en NVS, usando valor por defecto.\n", key);
    }

    nvs_close(nvs);
    return value;
}*/


// ----- Verificar y reconectar WiFi -----
void verificarConexionWiFi() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi desconectado. Intentando reconectar...");
        //WiFi.disconnect();
        WiFi.reconnect();

        int intentos = 0;
        while (WiFi.status() != WL_CONNECTED && intentos < 15) {
            Serial.print(".");
            delay(1000);
            intentos++;
        }

        if (WiFi.status() == WL_CONNECTED) {
            Serial.println("\nWiFi reconectado con éxito!");
        } else {
            Serial.println("\nNo se pudo reconectar. Se continuará con las raciones almacenadas.");
        }
    }
}

// ----- Obtener hora actual -----
String obtenerHoraActual() {
    struct tm timeinfo;
    if (!getLocalTime(&timeinfo)) {
        Serial.println("Error obteniendo la hora");
        return "00:00";
    }
    char buffer[6];
    strftime(buffer, sizeof(buffer), "%H:%M", &timeinfo);
    return String(buffer);
}

// ----- Inicializar NTP -----
void inicializarNTP() {
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
    Serial.println("Esperando sincronización con NTP...");
    delay(2000);
    Serial.println("Hora actual: " + obtenerHoraActual());
}

// ----- WebSocket -----
void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
    if (type == WStype_TEXT) {
        String message = (char*)payload;
        Serial.printf("WebSocket recibido: %s\n", message.c_str());

        if (message == "alimentar") {
            alimentarAhora = true;
        } else if (message.startsWith("update_raciones")) {
            obtenerRaciones();
        } else if (message == "desvincular") { 
            Serial.println("El dispositivo fue desvinculado. Borrando credenciales y entrando en modo AP...");
            // Borrar todas las credenciales y device_id de la NVS
            nvs_handle_t nvs;
            esp_err_t err = nvs_open("storage", NVS_READWRITE, &nvs);
            if (err == ESP_OK) { 
                nvs_erase_all(nvs);
                nvs_commit(nvs);
                nvs_close(nvs);
                Serial.println("Credenciales eliminadas correctamente.");
            } else {
                Serial.println("Error al abrir NVS para borrar credenciales.");
            } 
            delay(3000);
            
            // Reiniciar en modo AP
            ESP.restart();
        }
    }
}

// ----- Entrar en modo de bajo consumo -----
/*void entrarModoSleep() {
    if (raciones.empty()) return;

    String horaActual = obtenerHoraActual();
    long tiempoEspera = 60;

    for (const Racion& racion : raciones) {
        long minutosActuales = horaActual.substring(0, 2).toInt() * 60 + horaActual.substring(3, 5).toInt();
        long minutosRacion = racion.hora.substring(0, 2).toInt() * 60 + racion.hora.substring(3, 5).toInt();
        long diferencia = minutosRacion - minutosActuales;

        if (diferencia > 0 && diferencia < tiempoEspera) {
            tiempoEspera = (diferencia * 60) - 5;
        }
    }

    Serial.printf("Entrando en Light Sleep por %ld segundos...\n", tiempoEspera);
    esp_sleep_enable_timer_wakeup(tiempoEspera * 1000000);
    esp_light_sleep_start();
}
*/

// ----- esperar a próxima ración -----
void esperarRacion() {
    if (raciones.empty()) return;

    String horaActual = obtenerHoraActual();
    long minutosActuales = horaActual.substring(0, 2).toInt() * 60 + horaActual.substring(3, 5).toInt();

    for (const Racion& racion : raciones) {
        long minutosRacion = racion.hora.substring(0, 2).toInt() * 60 + racion.hora.substring(3, 5).toInt();
        long minutosDiferencia = minutosRacion - minutosActuales;

        if (minutosDiferencia > 0 && minutosDiferencia > 5) { //si la espera es mayor a 5 minutos entra en delay
            Serial.printf("Esperando a la próxima ración, programada para dentro de %ld minutos.\n", minutosDiferencia);
            delay(minutosDiferencia*60*1000);  //minutos a segundos a milisegundos
        }
    }

    Serial.printf("Esperando a la próxima ración, programada para dentro de %ld minutos.\n", minutosDiferencia);
    
}


// ----- Setup -----
void setup() {
    Serial.begin(115200);
    
    //------ inicia AP y conecta de red doméstica luego de recibir credenciales -----

    esp_err_t ret = nvs_flash_secure_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_secure_init();
    }
    ESP_ERROR_CHECK(ret);
    ESP_LOGI(TAG, "NVS cifrada lista.");

    esp_netif_init();
    esp_event_loop_create_default();

    wifi_init_softap();  // Inicia AP seguro

    start_https_server();  // HTTPS server para configuración segura

    ESP_LOGI(TAG, "Esperando credenciales vía HTTPS...");
    
    //----- fin bloque ----- 

    //----- recibir credenciales y conectar a red doméstica -----

    device_id = read_credentials_nvs("device_id");

    inicializarNTP();
    obtenerRaciones();
    webSocket.begin(WEBSOCKET_SERVER, ca_cert);
    webSocket.onEvent(webSocketEvent);
}

// ----- Loop -----
void loop() {
    verificarConexionWiFi();  // Verifica si el WiFi sigue conectado
    webSocket.loop();

    String horaActual = obtenerHoraActual();
    for (const Racion& racion : raciones) {
        if (horaActual == racion.hora) {
            expenderComida(racion.cantidad);
            medirPeso();
        }
    }

    if (alimentarAhora) {
        if (!raciones.empty()) {
            expenderComida(raciones.back().cantidad);
            medirPeso();
        }
        alimentarAhora = false;
    }

    //entrarModoSleep();
    //esperarRacion();
}
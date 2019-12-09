#include <Arduino.h>
#include <DNSServer.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ArduinoJson.h>
#include <WiFiManager.h>
#include <WebSockets.h>
#include <WebSocketsServer.h>
#include <rgb_driver/rgb_classlib.h>

#define pin_count 3

int pins[pin_count] = {5, 4, 0};

const uint16_t a = 1023;
const uint16_t b = 254;

WebSocketsServer webSocket = WebSocketsServer(81);
std::array<unsigned short int, 3> rgb_old;

void flash_p_colors(uint8_t num)
{
  std::array<unsigned short int, 3> rgb;
  int zc = 0;
  do
  {
    for (size_t i = 0; i < pin_count; i++)
    {
      rgb[i] = rand() % 2;
      if (rgb[i] == 0)
        zc++;
      if (zc > 2)
        rgb[rand() % 3] = 1;
    }
  } while (rgb == rgb_old);
  for (size_t i = 0; i < 3; i++)
  {
    digitalWrite(pins[0], rgb[0]);
    digitalWrite(pins[1], rgb[1]);
    digitalWrite(pins[2], rgb[2]);
  }
  rgb_old = rgb;
  webSocket.sendTXT(num,"tick");
}

void turn_off_leds()
{
  for (int i = 0; i < pin_count; i++)
  {
    digitalWrite(pins[i], 0);
  }
}

void display_rgb () {
  
}

void dimming_led(uint8_t *payload)
{
  uint16_t brightness = (uint16_t)strtol((const char *)&payload[1], NULL, 10);
  analogWrite(pins[0], brightness);
  Serial.print("pwm:");
  Serial.println(brightness);
}

void log_text_payload(uint8_t *payload, size_t lenght)
{
  for (uint i = 0; i < lenght; i++)
  {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t lenght)
{
  if (type == WStype_TEXT)
  {
    switch (payload[0])
    {
    case '@':
      dimming_led(payload);
      break;
    case '-':
      flash_p_colors(num);
      break;
    case '!':
      turn_off_leds();
      break;
    default:
      log_text_payload(payload, lenght);
      break;
    }
  }
  else
  {
    switch (type)
    {
    case WStype_CONNECTED:
      Serial.println("client connected");
      webSocket.sendTXT(num,"WELCOME!");
      break;
    case WStype_DISCONNECTED:
      Serial.println("client disconnected");
      break;
    case WStype_ERROR:
      Serial.println("there has been a WS ERROR");
      log_text_payload(payload, lenght);
      break;
    case WStype_FRAGMENT_TEXT_START:
    case WStype_FRAGMENT_BIN_START:
    case WStype_FRAGMENT:
    case WStype_FRAGMENT_FIN:
      break;
    }
  }
}

void jsonify(){
  StaticJsonDocument<200> doc;
  doc["red"] = 255;
  doc["green"] = 255;
  doc["blue"] = 255;
  serializeJson(doc, Serial);
}

void setup()
{
  Serial.begin(115200);
  WiFiManager wifiManager;
  wifiManager.autoConnect("autocon_AP");
  Serial.println("Connected!");
  for (int i = 0; i < pin_count; i++)
  {
    pinMode(pins[i], 1);
    digitalWrite(pins[i], 0);
  }
  webSocket.onEvent(webSocketEvent);
  webSocket.begin();
  jsonify();
}

void loop()
{
  webSocket.loop();
}




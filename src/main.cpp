#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WiFiManager.h>  
#include <WebSocketsServer.h>
#include <DNSServer.h>
#include <rgb_driver/rgb_classlib.h>

#define pin_count 3

std::array<unsigned short int, 3> rgb_old;

int pins[pin_count] = {16, 5, 4};

const uint16_t a = 1023;
const uint16_t b = 254;

WebSocketsServer webSocket = WebSocketsServer(81);

void flash_p_colors()
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
}

void turn_off_leds()
{
  for (int i = 0; i < pin_count; i++)
  {
    digitalWrite(pins[i], 0);
  }
}

void dimming_led(uint8_t *payload)
{
  uint16_t brightness = (uint16_t)strtol((const char *)&payload[1], NULL, 10);
  analogWrite(pins[0], brightness);
  Serial.print("pwm:");
  Serial.println(brightness);
}

void log_text_payload(uint8_t *payload,size_t lenght)
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
      flash_p_colors();
      break;
    case '!':
      turn_off_leds();
      break;  
    default:
      log_text_payload(payload,lenght);
      break;
    }
  }
  else
  {
    switch (type)
    {
    case WStype_DISCONNECTED:
      Serial.println("client disconnected");
      break;
    case WStype_CONNECTED:
      Serial.println("client connected");
      break;
    case WStype_ERROR:
      Serial.println("there has been a WS ERROR");
      log_text_payload(payload,lenght);
      break;
		case WStype_FRAGMENT_TEXT_START:
		case WStype_FRAGMENT_BIN_START:
		case WStype_FRAGMENT:
		case WStype_FRAGMENT_FIN:
    break;  
    }
  }
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
    Rgb wht(0);
  }

  void loop()
  {
    webSocket.loop();
  }

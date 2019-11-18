#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <ESP8266HTTPClient.h>

#define pin_count 3

int pins[pin_count] = {16, 5, 4};

const uint16_t a = 1023;
const uint16_t b = 254;

const char ssid[] = "LAMBDA";
const char password[] = "haruhi555";
WebSocketsServer webSocket = WebSocketsServer(81);

class Rgb
{
private:
  uint red;
  uint green;
  uint blue;

public:
  Rgb(int color)
  {
    set_color(color);
  }
  void set_color(int color)
  {
    switch (color)
    {
    case 0:
      red = 1023;
      green = 1023;
      blue = 1023;
      Serial.println("color white");
      break;
    case 1:
      red = 0;
      green = 0;
      blue = 1023;
    case 2:
      red = 1023;
      green = 0;
      blue = 0;
    case 3:
      red = 1023;
      green = 1023;
      blue = 0;

    default:
      Serial.println("default");
      break;
    }
  }
  void print_values()
  {
    Serial.printf("red: %u \n", red);
    Serial.printf("green: %u \n", green);
    Serial.printf("blue: %u \n", blue);
  }
};

void send_http_request()
{
  if (WiFi.status() == WL_CONNECTED)
  { //Check WiFi connection status

    HTTPClient http; //Declare an object of class HTTPClient

    http.begin("127.0.0.1"); //Specify request destination
    int httpCode = http.GET();                                 //Send the request

    if (httpCode > 0)
    { //Check the returning code

      String payload = http.getString(); //Get the request response payload
      Serial.println(payload);           //Print the response payload
    }

    http.end(); //Close connection
  }
}

void flash_p_colors()
{
  std::array<unsigned short int, 3> rgb_old;
  std::array<unsigned short int, 3> rgb;
  for (;;)
  {
    send_http_request();
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
    delay(1000);
  }
}


void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t lenght)
{
  if (type == WStype_TEXT)
  {
    if (payload[0] == '@')
    {
      for (uint i = 0; i < lenght; i++)
      {
        Serial.print(payload[i]);
      }
      Serial.println();
      uint16_t brightness = (uint16_t)strtol((const char *)&payload[1], NULL, 10);
      analogWrite(pins[0], brightness);
      Serial.print("pwm:");
      Serial.println(brightness);
    }
    else if (payload[0] == '-')
    {
      Serial.println("confirmed");
      flash_p_colors();
    }
    else
    {
      for (uint i = 0; i < lenght; i++)
      {
        Serial.print((char)payload[i]);
      }
      Serial.println();
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
    }
  }
}

void setup()
{
  Serial.begin(115200);
  for (int i = 0; i < pin_count; i++)
  {
    pinMode(pins[i], 1);
    digitalWrite(pins[i], 0);
  }
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }
  Serial.print("Connection Completed:");
  Serial.println(WiFi.localIP());
  webSocket.onEvent(webSocketEvent);
  webSocket.begin();
  Rgb white(0);
  white.print_values();
}

void loop()
{
  webSocket.loop();
}

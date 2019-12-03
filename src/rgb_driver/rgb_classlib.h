#include <Arduino.h>

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
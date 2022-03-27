#include <stdio.h>  
#include <math.h> 
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include "photoresistor.c"
#include "temperature.c"
#include "DHTesp.h"
#include <LiquidCrystal_I2C.h>

#define LEFT 4
#define RIGHT 18

#define PLANTA1_photoresistor 34
#define PLANTA1_temperature 33

#define ESTUFA_temperature 26

#define PLANTA2_photoresistor 35
#define PLANTA2_temperature 27

DHTesp planta1;
DHTesp planta2;

#include <WiFi.h>
#include <HTTPClient.h>

LiquidCrystal_I2C lcd(0x27, 20, 4);  
static uint8_t taskCoreOne  = 1;

void setup() {
  Serial.begin(115200);

  pinMode(ESTUFA_temperature, INPUT);

  pinMode(PLANTA1_photoresistor, INPUT);
  pinMode(PLANTA2_photoresistor, INPUT);

  pinMode(LEFT, INPUT_PULLUP);
  pinMode(RIGHT, INPUT_PULLUP);

  planta1.setup(PLANTA1_temperature, DHTesp::DHT22);
  planta2.setup(PLANTA2_temperature, DHTesp::DHT22);
  
  lcd.init();
  lcd.backlight();

  xTaskCreatePinnedToCore(connectServer,"connectServer",8000,NULL,2,NULL,taskCoreOne);

}

void imprimeEspecie(String name,String temp,String humid,String luz){
  lcd.setCursor(5, 0);
  lcd.print(name);

  lcd.setCursor(2, 1);
  lcd.print(luz);

  lcd.setCursor(0, 2);
  lcd.print("Temp");
  lcd.setCursor(15, 2);
  lcd.print("Humid");

  lcd.setCursor(0, 3);
  lcd.print(temp + " C");
  lcd.setCursor(14, 3);
  lcd.print(humid+" %");
}

void imprimeAmbiente(String temp){
  lcd.setCursor(5,0);
  lcd.print("Ambiente");
  lcd.setCursor(6, 1);
  lcd.print(temp + " C");
  lcd.setCursor(0, 3);
  lcd.print(" Reservatorio baixo");

}

int paginas = 0;
int leftLast = HIGH;
int rightLast = HIGH;

void button(int PIN, int *last,int control){
  int button_key = digitalRead(PIN);
  if (*last != button_key) {
  *last = button_key;
    if (button_key == HIGH) {
      if(control == 1 && paginas<2) {
       lcd.clear();
       paginas+=1;
      }
      else if(control == 0 && paginas>0) {
        lcd.clear(); 
        paginas-=1;
      }
    }
  }
}

String addData(const char* n,String t,String h,String l){
  return "&$n="+String(n)+"$t="+t+"$h="+h+"$l="+l;
}

String payload_post = "";

void loop() {

  float tempe = 20.0;
  float temperature = getTemperature(ESTUFA_temperature);

  button(LEFT,&leftLast,0);
  button(RIGHT,&rightLast,1);

  int lux_planta1 = getLux(PLANTA1_photoresistor);
  int lux_planta2 = getLux(PLANTA2_photoresistor);

  TempAndHumidity data_planta1 = planta1.getTempAndHumidity();
  TempAndHumidity data_planta2 = planta2.getTempAndHumidity();


  String dados = addData("Orquideas",String(data_planta1.temperature, 1),
  String(data_planta1.humidity, 1),String(getLuminosidade(lux_planta1)));
  dados+=addData("Jasmin",String(data_planta2.temperature, 1),
  String(data_planta2.humidity, 1),String(getLuminosidade(lux_planta2)));
  dados+=addData("Ambiente",String(temperature,1),String("null"),String("null"));

  payload_post = dados;

  switch (paginas) {
    case 0:
      imprimeEspecie("Orquideas",String(data_planta1.temperature, 1),String(data_planta1.humidity, 1),String(getLuminosidade(lux_planta1)));
      break;
    case 1:
      imprimeEspecie("  Jasmin ",String(data_planta2.temperature, 1),String(data_planta2.humidity, 1),String(getLuminosidade(lux_planta2)));
      break;
    case 2:
      imprimeAmbiente(String(temperature,1));
      break;
  }

  // delay(500);
}

void connectWifi(){
  Serial.print("Connecting to WiFi");
  WiFi.begin("Wokwi-GUEST", "", 8);
  while (WiFi.status() != WL_CONNECTED) {
    delay(100);
    Serial.print(".");
  }
  Serial.println(" Connected!");
}

String HOST = "http://6dc7-170-79-55-83.ngrok.io";

void connectServer( void * pvParameters ){
    connectWifi();
    while(true){
      if(WiFi.status() == WL_CONNECTED){
        // HTTPClient http;
        // http.begin(HOST+"/getData");
        // int httpCode = http.GET();
        // if (httpCode == 200) {
        //     String payload = http.getString();
        //     Serial.println(payload);
        // }
        // else{
        //   Serial.println(httpCode);
        // }
        // http.end();
        HTTPClient http_post;
        http_post.begin(HOST);
        http_post.addHeader("Content-Type", "text/plain");
        int post_code = http_post.POST(payload_post);
        if(post_code != 200){
          Serial.println(String("Sem resposta ! ")+String(post_code));
        }
        else{
          String response = http_post.getString();
          Serial.println(response);
        }
        http_post.end();
      }
      else{
        Serial.println("Desconectado !");
        WiFi.reconnect();
      }
      delay(1000);
    } 
}
/*
function myresponse() {
  let id = "demo";
  let value = "555";
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("debug").innerHTML = this.responseText;
    }
  };
  xhttp.open("GET", `sonoff?${id}=${value}`, true);
  xhttp.send();
}
*/

//const {RGBobj,Pallets} = require("./extra_classes");

var timer_obj;
var velocity = 1000;
var pwm = 1023;
var range = document.getElementById("myRange");
var range_value = document.getElementById("range_value");

var ranges = {
  range_vel: document.getElementById("rangeVel"),
  range_pwm: document.getElementById("rangePwm"),
  range_vel_value: document.getElementById("range_vel_value"),
  range_pwm_value: document.getElementById("range_pwm_value"),
}

var color_mode = {
  btn1: document.getElementById("mode1"),
  btn2: document.getElementById("mode0"),
  btn3: document.getElementById("mode2"),
};

var inputs = {
  red: document.getElementById("red"),
  green: document.getElementById("green"),
  blue: document.getElementById("blue"),
};

var btn = document.getElementById("addbt")
var light_modes = ["FADE", "FLASH", "STATIC"];
var current_color_mode;
var light_mode = 0;
var current_mode;

class RGBobj {
  constructor(r, g, b) {
      this.red = r;
      this.green = g;
      this.blue = b;
  }
  set_values(rgba) {
      this.red = rgba[0];
      this.green = rgba[1];
      this.blue = rgba[2];
  }
  get_values() {
      let rgb = [this.red, this.green, this.blue];
      return rgb;
  }
}

var rgb_obj1 = new RGBobj(0, 0, 0);
var rgb_obj2= new RGBobj(0, 0, 0);
var rgb_obj3 = new RGBobj(0, 0, 0);

class Pallets {
  current_obj = null;
  cur_plt = null;
  elements = {
      parent: document.getElementById("pallet_array"),
      plt1: document.getElementById("pallet1"),
      plt2: document.getElementById("pallet2"),
      plt3: document.getElementById("pallet3"),
      list: function () {
          return [this.plt1, this.plt2, this.plt3]
      },
  };
  constructor() {
    console.log("pallet instantiate");
  }

  list() {
      let arr = this.elements.list();
      for (let i = 0; i < arr.length; i++) {
          const element = array[i];
          console.log(element);
      }
  }
  highlight(a) {
      this.arr = this.elements.list();
      this.arr.forEach(element => {
          if (element == this.arr[a]) {
              element.style.opacity = 1;
          } else {
              element.style.opacity = 0.5;
          }
      });
  }
}
var pallet = new Pallets();

var ip_addr = "192.168.15.41";
var connection = new WebSocket("ws://" + ip_addr + ":81/");

connection.onopen = function () {
  console.log("open connection");
  document.getElementById("ws_status").innerHTML = "Connected";
  document.getElementById("ws_status").style.backgroundColor = "green";
  connection.send("client connection:" + new Date());
};
connection.onclose = function () {
  console.log("close connection");
  document.getElementById("ws_status").innerHTML = "Awaiting connection...";
}
connection.onerror = function (error) {
  console.log("websocket error ", error);
};
connection.onmessage = function (e) {
  console.log("Server: ", e.data);
};

function sendMsg(a) {
  connection.send(a);
}

function enabled_pallets(mode) {
  let c_plt = document.getElementsByClassName("block-c");

  switch (mode) {
    case "single":
      for (let i = 0; i < c_plt.length; i++) {
        c_plt[i].style.display = "none";
      }
      c_plt[0].style.display = "block";
      break;
    case "double":
      for (let i = 0; i < c_plt.length; i++) {
        c_plt[i].style.display = "none";
      }
      for (let i = 0; i < 2; i++) {
        c_plt[i].style.display = "block";
      }
      break;
    case "triple":
      for (let i = 0; i < c_plt.length; i++) {
        c_plt[i].style.display = "block";
      }
      break;
    default:
      console.log("invalid mode");
  }
}
function switch_bar_enabled(a) {
  console.log("hello bar");
  var s_bar = document.getElementById("s_bar");
  if (a == true) {
    s_bar.style.display = "flex";
  } else {
    s_bar.style.display = "none";
  }
}

function set_color_p() {
  let rgbA = get_rgb_values();
  pallet.cur_plt.style.backgroundColor = `rgb(${rgbA[0]},${rgbA[1]},${rgbA[2]})`;
  pallet.current_obj.set_values(rgbA);
  send_rgb();
}

function start() {
  if (timer_obj != null) clearInterval(timer_obj);
  timer_obj = setInterval(function () {
    sendMsg("-");    
  }, velocity);
}

function send_rgb () {
  if(current_mode == "2"){
    let _rgb = pallet.current_obj.get_values();
    let str1 = _rgb[0];
    let str2 = _rgb[1];
    let str3 = _rgb[2];
    sendMsg("$^"+str1+"^"+str2+"^"+str3);
  }else{
    console.log("not in static");
  }
}

function stop() {
  if (timer_obj != null) clearInterval(timer_obj);
  sendMsg("!");
}

function change_mode() {
  let len = light_modes.length;
  let case1 = document.getElementById("mode");
  light_mode++;
  if (light_mode > len - 1) {
    light_mode = 0;
  }
  if (light_mode == 2) {
    pallet.elements.parent.style.display = "flex";
    enabled_pallets("single");
    switch_bar_enabled(false);
  } else {
    enabled_pallets("triple");
    switch_bar_enabled(true);
  }
  current_mode = light_mode;
  case1.innerHTML = light_modes[light_mode];
  sendMsg("*" + current_mode);
}

function change_color_mode(arg) {
  if (arg == 1) {
    current_color_mode = 1;
    pallet.elements.parent.style.display = "flex";
    color_mode.btn1.style.backgroundColor = "green";
    color_mode.btn2.style.backgroundColor = "#666";
    color_mode.btn3.style.backgroundColor = "#666";
    enabled_pallets("triple");
    console.log("mode 1");
  } else if (arg == 2) {
    current_color_mode = 2;
    pallet.elements.parent.style.display = "flex";
    color_mode.btn3.style.backgroundColor = "green";
    color_mode.btn1.style.backgroundColor = "#666";
    color_mode.btn2.style.backgroundColor = "#666";
    enabled_pallets("double");
    console.log("mode 2");
  }
  else {
    current_color_mode = 0;
    pallet.elements.parent.style.display = "none";
    color_mode.btn2.style.backgroundColor = "green";
    color_mode.btn1.style.backgroundColor = "#666";
    color_mode.btn3.style.backgroundColor = "#666";
    console.log("mode 0");
  }
  sendMsg("#" + current_color_mode);
}

function set_plt(arg) {
  if (arg == 1) {
    pallet.cur_plt = pallet.elements.plt1;
    pallet.current_obj = rgb_obj1;
    pallet.highlight(0);
    load_rgb_values();
  } else if (arg == 2) {
    pallet.cur_plt = pallet.elements.plt2;
    pallet.current_obj = rgb_obj2;
    pallet.highlight(1);
    load_rgb_values();
  } else {
    pallet.cur_plt = pallet.elements.plt3;
    pallet.current_obj = rgb_obj3;
    pallet.highlight(2);
    load_rgb_values();
  }
}

function load_rgb_values() {
  let rgba = pallet.current_obj.get_values();
  inputs.red.value = rgba[0];
  inputs.green.value = rgba[1];
  inputs.blue.value = rgba[2];
}

function get_rgb_values() {
  const elements = Object.values(inputs);
  let rgbV = [];
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const value = element.value;
    if (value == "" || value < 0) {
      rgbV[i] = 0;
      element.value = 0;
    } else if (value > 255) {
      rgbV[i] = 255;
      element.value = 255;
    } else {
      rgbV[i] = value;
    }
  }
  return rgbV;
}

inputs.red.addEventListener("change", set_color_p, false);
inputs.green.addEventListener("change", set_color_p, false);
inputs.blue.addEventListener("change", set_color_p, false);

ranges.range_vel.addEventListener(
  "input",
  function () {
    velocity = ranges.range_vel.value;
    ranges.range_vel_value.innerHTML = velocity + "ms";
  },
  false
);

ranges.range_pwm.addEventListener(
  "input",
  function () {
    pwm = ranges.range_pwm.value;
    ranges.range_pwm_value.innerHTML = pwm;
    sendMsg("@" + pwm);
  },
  false
);
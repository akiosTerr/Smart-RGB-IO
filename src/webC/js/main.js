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
function switch_bar_enabled (a){
  console.log("hello bar");
  var s_bar = document.getElementById("s_bar");
  if (a == true) {
    s_bar.style.display = "flex";
  }else{
    s_bar.style.display = "none";
  }
}

var color_mode = {
  btn1: document.getElementById("mode1"),
  btn2: document.getElementById("mode0"),
  btn3: document.getElementById("mode2"),
};
var pallets = {
  current_obj: null,
  cur_plt: null,
  parent: document.getElementById("pallet_array"),
  plt1: document.getElementById("pallet1"),
  plt2: document.getElementById("pallet2"),
  plt3: document.getElementById("pallet3"),
};
var inputs = {
  red: document.getElementById("red"),
  green: document.getElementById("green"),
  blue: document.getElementById("blue"),
};
var btn = document.getElementById("addbt")
var light_modes = ["FADE", "FLASH", "STATIC"];
var current_color_mode;
var plt_id;
var light_mode = 0;
var current_mode;
var current_pallet;

var ip_addr = "192.168.15.41";
var connection = new WebSocket("ws://" + ip_addr + ":81/");
connection.onopen = function () {
  console.log("open connection");
  document.getElementById("ws_status").innerHTML = "Connected";
  connection.send("client connection:" + new Date());
};
connection.onerror = function (error) {
  console.log("websocket error ", error);
};
connection.onmessage = function (e) {
  console.log("Server: ", e.data);
};

function sendMsg(a) {
  connection.send(a);
}

class rgbObj {
  constructor(r, g, b) {
    this.red = r;
    this.green = g;
    this.blue = b;
  }
  set_values(rgb) {
    this.red = rgb[0];
    this.green = rgb[1];
    this.blue = rgb[2];
  }

}
var pallet1 = new rgbObj(0, 0, 0);
var pallet2 = new rgbObj(0, 0, 0);
var pallet3 = new rgbObj(0, 0, 0);

function add_rgb() {
  let values = get_rgb_values();
  let str = `rgb(${values[0]},${values[1]},${values[2]})`;
  pallets.cur_plt.style.backgroundColor = str;
  pallets.current_obj.set_values(values);
  sendMsg("-");
}

function change_mode() {
  let len = light_modes.length;
  let case1 = document.getElementById("mode");
  light_mode++;
  if (light_mode > len - 1) {
    light_mode = 0;
  }
  if (light_mode == 2) {
    pallets.parent.style.display = "flex";
    enabled_pallets("single");  
    switch_bar_enabled(false);
  }else{
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
    pallets.parent.style.display = "flex";
    enabled_pallets("triple");
    color_mode.btn1.style.backgroundColor = "green";
    color_mode.btn2.style.backgroundColor = "#666";
    color_mode.btn3.style.backgroundColor = "#666";
    console.log("mode 1");
  } else if (arg == 2) {
    current_color_mode = 2;
    pallets.parent.style.display = "flex";
    color_mode.btn3.style.backgroundColor = "green";
    color_mode.btn1.style.backgroundColor = "#666";
    color_mode.btn2.style.backgroundColor = "#666";
    enabled_pallets("double");
    console.log("mode 2");
  }
  else {
    current_color_mode = 0;
    pallets.parent.style.display = "none";
    color_mode.btn2.style.backgroundColor = "green";
    color_mode.btn1.style.backgroundColor = "#666";
    color_mode.btn3.style.backgroundColor = "#666";
    console.log("mode 0");
  }
  sendMsg("#" + current_color_mode);
}

function set_plt(arg) {
  plt_id = arg;
  if (arg == 1) {
    pallets.cur_plt = pallets.plt1;
    pallets.current_obj = pallet1;
    pallets.plt1.style.opacity = 1;
    pallets.plt2.style.opacity = 0.7;
    pallets.plt3.style.opacity = 0.7;
  } else if (arg == 2) {
    pallets.cur_plt = pallets.plt2;
    pallets.current_obj = pallet2;
    pallets.plt2.style.opacity = 1;
    pallets.plt1.style.opacity = 0.7;
    pallets.plt3.style.opacity = 0.7;
  } else {
    pallets.cur_plt = pallets.plt3;
    pallets.current_obj = pallet3;
    pallets.plt3.style.opacity = 1;
    pallets.plt1.style.opacity = 0.7;
    pallets.plt2.style.opacity = 0.7;
  }
}

function blank_plt() {
  pallets.cur_plt.style.backgroundColor = "darkgray";
}


inputs.red.addEventListener("change", set_color_p, false);
inputs.green.addEventListener("change", set_color_p, false);
inputs.blue.addEventListener("change", set_color_p, false);


function set_color_p() {
  let Ca = get_rgb_values();
  btn.style.backgroundColor = `rgb(${Ca[0]},${Ca[1]},${Ca[2]})`;
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



var range = document.getElementById("myRange");
var range_value = document.getElementById("range_value");

range.addEventListener(
  "input",
  function () {
    let velocity = range.value;
    range_value.innerHTML = velocity;
    sendMsg("@" + velocity);
  },
  false
);
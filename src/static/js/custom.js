var menu = document.getElementsByClassName("main-menu")[0];
var anchors = menu.getElementsByTagName("a");
var trigger;

for (var i = 0; i < anchors.length; i++) {
  a = anchors[i];
  if (a.href.indexOf("#theme") >= 0) {
    trigger = a;
  }
}

theme = document.cookie.match("theme=([^;]+)");

if (theme) {
  mode = theme[1];

  if (mode == "night") {
    document.body.classList.add("night");
    document.body.classList.remove("day");
    trigger.innerText = "Day Mode";
  }

  if (mode == "day") {
    document.body.classList.add("day");
    document.body.classList.remove("night");
    trigger.innerText = "Night Mode";
  }
}

function themeSwitch(e) {
  if (e.target.href.indexOf("#theme") >= 0) {
    document.body.classList.toggle("night");

    if (document.body.classList.contains("night")) {
      e.target.innerText = "Day Mode";
      document.cookie = "theme=night;domain=.integralist.co.uk;path=/";
    } else {
      e.target.innerText = "Night Mode";
      document.cookie = "theme=day;domain=.integralist.co.uk;path=/";
    }
  }
}

var menu = document.getElementById("navmenu");

menu.addEventListener("click", themeSwitch);

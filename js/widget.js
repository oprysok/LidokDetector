/*global window, document, Widget:true, moment, ajax, console*/
function Widget() {
    "use strict";
    this.lastResult = null;
    this.currentLocationName = null;
    this.employeeList = null;
    this.areaList = [
        "Office KBP1-C",
        "Office KBP1-R",
        "Office KBP2-R",
        "Office KBP3-C",
        "Office KBP3-D",
        "Office KBP3-G",
        "Office KBP3-L",
        "Office KBP3-R",
        "Office KBP4-C",
        "Office KBP4-G",
        "Office KBP4-L",
        "Office KBP4-R",
        "Office KBP5-C",
        "Office KBP5-G",
        "Office KBP5-L",
        "Office KBP5-R",
    ];
    this.settings = {
        "interval": 3000,
        "userId": 2323,
        "name": "Andrii Klymenko",
        "alias": "Lidok",
        "homeArea": "Office KBP3-L",
        "mute": false
    };
    this.dom = {
        userSpan: document.getElementById("user"),
        locationSpan: document.getElementById("location"),
        backgroundEl: document.getElementById("imgBackground"),
        whenSpan: document.getElementById("when"),
        statusSpan: document.getElementById("status"),
        settingsSpan: document.getElementById("settingButton"),
        settings: document.getElementById("settings"),
        saveSpan: document.getElementById("saveButton"),
        employeesInputAc: document.getElementById("employees"),
        employeesInputId: document.getElementById("empId"),
        intervalInput: document.getElementById("intervalInput"),
        areaInput: document.getElementById("areaInput"),
        areasSuggestions: document.getElementById("foundArea"),
        aliasInput: document.getElementById("aliasInput"),
        muteInput: document.getElementById("muteInput"),
        employeesSuggestions: document.getElementById("found")
    };
    this.audio = {
        near: "sounds\\e-pacantre.wav",
        far: "sounds\\zbs.wav"
    };
    this.url = {
        employees: "http://poc-cont2-srv/polygon/json/employees",
        lastSeen: "http://poc-cont2-srv/polygon/json/last_seen?employeeId="
    };
}
Widget.prototype.changeState = function (detected) {
    "use strict";
    //debugger;
    if (detected) {
        if (this.lastResult === null || !this.lastResult) {
            this.lastResult = true;
            this.playSound(this.audio.near);
        }
        this.dom.backgroundEl.style.background = "#e74c3c";
        this.dom.statusSpan.innerHTML = this.settings.alias != "" ? this.settings.alias + " detected!" : "Detected!";

    } else {
        if (this.lastResult === null || this.lastResult) {
            this.lastResult = false;
            this.playSound(this.audio.far);
        }
        this.dom.backgroundEl.style.background = "#27ae60";
        this.dom.statusSpan.innerHTML = "OK";
    }
};
Widget.prototype.storeEmployees = function (employees, that) {
    "use strict";
    that.employeeList = JSON.parse(employees);
};
Widget.prototype.getEmployees = function () {
    "use strict";
    if (this.employeeList === null) {
        ajax(this.url.employees, this.storeEmployees, this);
    }
};
Widget.prototype.checkLidok = function (obj, that) {
    "use strict";
    var res = JSON.parse(obj);
    that.currentLocationName = res.area.replace("Office KBP", "").replace("-", "");
    that.dom.locationSpan.innerHTML = res.direction === "in" ? "Now in " +  that.currentLocationName : "Last seen in " + that.currentLocationName;
    that.dom.userSpan.innerHTML = that.settings.name;
    that.dom.whenSpan.innerHTML = res.direction !== "in" ? "(" + moment(res.timestamp).fromNow() + ")" : "";
    //debugger;
    if (res.area === that.settings.homeArea && res.direction === "in") {
        that.changeState(true);
    } else {
        that.changeState(false);
    }
};
Widget.prototype.detect = function () {
    "use strict";
    ajax(this.url.lastSeen + this.settings.userId, this.checkLidok, this);
};
Widget.prototype.playSound = function (filepath) {
    "use strict";
    if (!this.settings.mute && window.Audio !== undefined) {
        var sound = new window.Audio(filepath);
        sound.play();
    } else if (!this.settings.mute && window.System !== undefined && System.Sound !== undefined) {
        System.Sound.playSound(filepath);
    }
};
Widget.prototype.closeSuggestions = function () {
    this.dom.employeesInputAc.style.border = "";
    this.dom.employeesSuggestions.style.display= "none";
    this.dom.employeesSuggestions.innerHTML = "";
};
Widget.prototype.openSuggestions = function () {
    this.dom.employeesInputAc.style.borderRight = "2px solid #996600";
    this.dom.employeesSuggestions.style.display= "block";
};
Widget.prototype.closeSettings = function () {
    document.body.setAttribute("data-showSettings","false");
    document.body.style.height = 58 +"px";
    this.dom.settings.style.display = "none";    
};
Widget.prototype.openSettings = function () {
    this.fillSettings();
    document.body.setAttribute("data-showSettings","true");
    document.body.style.height = 58 + 58 + 58 + 58 + 58 + "px";
    this.dom.settings.style.display = "block";   
};
Widget.prototype.fillSettings = function () {
    this.dom.employeesInputAc.value = this.settings.name;
    this.dom.employeesInputId.value = this.settings.userId;
    this.dom.aliasInput.value = this.settings.alias;
    this.dom.areaInput.value = this.settings.homeArea;
    this.dom.intervalInput.value = this.settings.interval;
    this.dom.muteInput.checked = this.settings.mute;
};
Widget.prototype.saveSettings = function () {
    if (this.dom.employeesInputId.value) {
        this.settings.name = this.dom.employeesInputAc.value;
        this.settings.userId = parseInt(this.dom.employeesInputId.value);
    }
    this.settings.alias = this.dom.aliasInput.value;
    this.settings.homeArea = this.dom.areaInput.value;
    if (!isNaN(this.dom.intervalInput.value)) {
        this.settings.interval = parseInt(this.dom.intervalInput.value);
    }
    this.settings.mute = this.dom.muteInput.checked;
    this.closeSuggestions();
};
//Event handlers
Widget.prototype.autocompleteHandler = function (event,that) {
    var keyCode, str, found, i, y, lName, fName, charCount;
    keyCode = ('which' in event) ? event.which : event.keyCode;
    if (keyCode === 40) {
        //handle down key - to be implemented
    } else if (keyCode === 27) {
        this.closeSuggestions();
    } else {
        charCount = that.value.toLowerCase().length;
        str = that.value.toLowerCase().replace(/^\s+|\s+$/g,"").split(" "); // replace is used to trim string. String.trim() in old ie not supported
        if (str[0]!=='' && charCount > 3) {
            this.dom.employeesSuggestions.innerHTML = "";
            for (i = 0; i < this.employeeList.length; i += 1) {
                lName = this.employeeList[i].last_name !== null ? this.employeeList[i].last_name.toLowerCase() : "empty";
                fName = this.employeeList[i].first_name !== null ? this.employeeList[i].first_name.toLowerCase() : "empty";
                found = true;
                for (y = 0; y < str.length; y += 1) {
                    if (lName.indexOf(str[y]) !==-1 || fName.indexOf(str[y]) !==-1) {
                        found = true;
                    } else {
                        found = false;
                        break;
                    }
                }
                if (found) {
                    this.dom.employeesSuggestions.innerHTML += "<div onmouseleave=\"return widget.onSuggestionOut(event, this);\" onmouseover=\"return widget.onSuggestionHover(event, this);\" onclick=\"return widget.suggestionClickHandler(event, this);\" class=\"suggestion\" data-id=\"" + this.employeeList[i].id  + "\">"+this.employeeList[i].first_name + " " + this.employeeList[i].last_name + "</div><br/>";
                }
            }
            if (this.dom.employeesSuggestions.innerHTML !== "") {
                this.openSuggestions();
            } else {
                this.closeSuggestions();
            }
        } else {
            this.closeSuggestions();
            this.dom.employeesInputId.value = this.settings.userId;
        }
    }
    this.changesMade();
};
Widget.prototype.suggestionClickHandler = function (event,that) {
    this.dom.employeesInputId.value = that.getAttribute("data-id");
    this.dom.employeesInputAc.value = that.innerHTML;
    this.closeSuggestions();
    this.changesMade();
};
Widget.prototype.onCogHover = function (event,that) {
    that.style.backgroundPosition = "-22px 0";
};
Widget.prototype.onCogOut = function (event,that) {
    that.style.backgroundPosition = "0 0";
};
Widget.prototype.onSuggestionHover = function (event,that) {
    that.style.background = "#16a085";
};
Widget.prototype.onSuggestionOut = function (event,that) {
    that.style.background = "";
};
Widget.prototype.changesMade = function () {
    if (this.settings.alias === this.dom.aliasInput.value && this.settings.userId === parseInt(this.dom.employeesInputId.value) && this.settings.homeArea === this.dom.areaInput.value && this.settings.interval === parseInt(this.dom.intervalInput.value) && this.settings.mute === this.dom.muteInput.checked) {
        this.dom.saveSpan.className = "disabled";
    } else {
        this.dom.saveSpan.className = "";
    }
};
Widget.prototype.onSaveClick = function (event,that) {
    if (that.className !== "disabled") {
        this.saveSettings();
        this.closeSettings();
        this.dom.saveSpan.className = "disabled";       
    }
};
Widget.prototype.onSettingsClick = function () {
    "use strict";
    if (document.body.getAttribute("data-showSettings")==="true") {
        this.closeSettings();
    } else {
        this.openSettings();
    };
};
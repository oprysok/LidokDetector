/*global window, document, Widget:true, ActiveXObject, moment, ajax, console*/
function Widget() {
    "use strict";
    this.configFileName = "config.json";
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
        "Office KBP5-R"
    ];
    this.settings = {};
    this.settingsDefault = {
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
    if (detected) {
        if (this.lastResult === null || !this.lastResult) {
            this.lastResult = true;
            this.playSound(this.audio.near);
        }
        this.dom.backgroundEl.style.background = "#e74c3c";
        this.dom.statusSpan.innerHTML = this.settings.alias !== "" ? this.settings.alias + " detected!" : "Detected!";

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
    if (res.area !== null && res.working !== false) {
        that.currentLocationName = res.area.replace("Office KBP", "").replace("-", "");
        that.dom.locationSpan.innerHTML = res.direction === "in" ? "Now in " +  that.currentLocationName : "Last seen in " + that.currentLocationName;
        that.dom.userSpan.innerHTML = that.settings.name;
        that.dom.whenSpan.innerHTML = res.direction !== "in" ? "(" + moment(res.timestamp).fromNow() + ")" : "";
        if (res.area === that.settings.homeArea && res.direction === "in") {
            that.changeState(true);
        } else {
            that.changeState(false);
        }
    } else {
        that.dom.userSpan.innerHTML = "";
        that.dom.whenSpan.innerHTML = "";
        that.dom.locationSpan.innerHTML = "";
        that.dom.statusSpan.innerHTML = "Not available";
        this.removeConfig();
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
    "use strict";
    this.dom.employeesInputAc.style.border = "";
    this.dom.employeesSuggestions.style.display = "none";
    this.dom.employeesSuggestions.innerHTML = "";
};
Widget.prototype.openSuggestions = function () {
    "use strict";
    this.dom.employeesInputAc.style.borderRight = "2px solid #996600";
    this.dom.employeesSuggestions.style.display = "block";
};
Widget.prototype.closeSettings = function () {
    "use strict";
    document.body.setAttribute("data-showSettings", "false");
    document.body.style.height = 58 + "px";
    this.dom.settings.style.display = "none";
};
Widget.prototype.openSettings = function () {
    "use strict";
    this.fillSettings();
    document.body.setAttribute("data-showSettings", "true");
    document.body.style.height = 58 + 58 + 58 + 58 + 58 + "px";
    this.dom.settings.style.display = "block";
};
Widget.prototype.fillSettings = function () {
    "use strict";
    this.dom.employeesInputAc.value = this.settings.name;
    this.dom.employeesInputId.value = this.settings.userId;
    this.dom.aliasInput.value = this.settings.alias;
    this.dom.areaInput.value = this.settings.homeArea;
    this.dom.intervalInput.value = this.settings.interval;
    this.dom.muteInput.checked = this.settings.mute;
};
Widget.prototype.saveSettings = function () {
    "use strict";
    if (this.dom.employeesInputId.value) {
        this.settings.name = this.dom.employeesInputId.getAttribute("data-name");
        this.settings.userId = parseInt(this.dom.employeesInputId.value, 10);
    }
    this.settings.alias = this.dom.aliasInput.value;
    this.settings.homeArea = this.dom.areaInput.value;
    if (!isNaN(this.dom.intervalInput.value)) {
        this.settings.interval = parseInt(this.dom.intervalInput.value, 10);
    }
    this.settings.mute = this.dom.muteInput.checked;
    this.closeSuggestions();
};
Widget.prototype.mergeSettings = function (obj1, obj2) {
    "use strict";
    var p;
    for (p in obj2) {
        if (obj2.hasOwnProperty(p)) {
            try {
                if (obj2[p].constructor === Object) {
                    obj1[p] = this.mergeSettings(obj1[p], obj2[p]);
                } else {
                    obj1[p] = obj2[p];
                }
            } catch (e) {
                obj1[p] = obj2[p];
            }
        }
    }
    return obj1;
};
Widget.prototype.applyConfig = function () {
    "use strict";
    this.dom.employeesInputId.setAttribute("data-name", this.settings.name);
    this.dom.employeesInputId.value = this.settings.userId;
};
Widget.prototype.saveConfig = function () {
    "use strict";
    var filespec, fso, a;
    if (window.ActiveXObject !== undefined && System.Gadget !== undefined) {
        filespec = System.Gadget.path + "\\" + this.configFileName;
        fso = new ActiveXObject("Scripting.FileSystemObject");
        if (fso.FileExists(filespec)) {
            fso.DeleteFile(filespec);
        }
        fso.CreateTextFile(filespec, true);
        a = fso.CreateTextFile(filespec, true);
        a.WriteLine(JSON.stringify(this.settings));
    }
};
Widget.prototype.readConfig = function () {
    "use strict";
    try {
        var filespec, fso, f;
        filespec = System.Gadget.path + "\\" + this.configFileName;
        fso = new ActiveXObject("Scripting.FileSystemObject");
        f = fso.OpenTextFile(filespec, 1).ReadAll();
        this.settings = this.mergeSettings(this.settingsDefault, JSON.parse(f));
    } catch (e) {
        this.settings = this.settingsDefault;
        this.applyConfig();
    }
};
Widget.prototype.removeConfig = function () {
    "use strict";
    var filespec, fso;
    if (window.ActiveXObject !== undefined && System.Gadget !== undefined) {
        filespec = System.Gadget.path + "\\" + this.configFileName;
        fso = new ActiveXObject("Scripting.FileSystemObject");
        if (fso.FileExists(filespec)) {
            fso.DeleteFile(filespec);
        }
    }
};
//Event handlers
Widget.prototype.autocompleteHandler = function (event, that) {
    "use strict";
    var keyCode, str, found, i, y, lName, fName, charCount;
    keyCode = (event !== undefined) ? event.which : event.keyCode;
    if (keyCode === 27) {
        this.closeSuggestions();
    } else {
        charCount = that.value.toLowerCase().length;
        str = that.value.toLowerCase().replace(/^\s+|\s+$/g, "").split(" "); // replace is used to trim string. String.trim() in old ie not supported
        if (str[0] !== '' && charCount > 3) {
            this.dom.employeesSuggestions.innerHTML = "";
            for (i = 0; i < this.employeeList.length; i += 1) {
                lName = this.employeeList[i].last_name !== null ? this.employeeList[i].last_name.toLowerCase() : "empty";
                fName = this.employeeList[i].first_name !== null ? this.employeeList[i].first_name.toLowerCase() : "empty";
                found = true;
                for (y = 0; y < str.length; y += 1) {
                    if (lName.indexOf(str[y]) !== -1 || fName.indexOf(str[y]) !== -1) {
                        found = true;
                    } else {
                        found = false;
                        break;
                    }
                }
                if (found) {
                    this.dom.employeesSuggestions.innerHTML += "<div onmouseleave=\"return widget.onSuggestionOut(this);\" onmouseover=\"return widget.onSuggestionHover(this);\" onclick=\"return widget.suggestionClickHandler(this, " + this.employeeList[i].id + ", '" + this.employeeList[i].first_name + " " + this.employeeList[i].last_name + "');\" class=\"suggestion\" data-id=\"" + this.employeeList[i].id  + "\">" + this.employeeList[i].first_name + " " + this.employeeList[i].last_name + "</div><br/>";
                }
            }
            if (this.dom.employeesSuggestions.innerHTML !== "") {
                this.openSuggestions();
            } else {
                this.closeSuggestions();
            }
        } else {
            this.closeSuggestions();
        }
    }
    this.changesMade();
};
Widget.prototype.suggestionClickHandler = function (that, id, name) {
    "use strict";
    this.dom.employeesInputId.value = parseInt(id, 10);
    this.dom.employeesInputId.setAttribute("data-name", name);
    this.dom.employeesInputAc.value = that.innerHTML;
    this.closeSuggestions();
    this.changesMade();
};
Widget.prototype.onCogHover = function (that) {
    "use strict";
    that.style.backgroundPosition = "-22px 0";
};
Widget.prototype.onCogOut = function (that) {
    "use strict";
    that.style.backgroundPosition = "0 0";
};
Widget.prototype.onSuggestionHover = function (that) {
    "use strict";
    that.style.background = "#16a085";
};
Widget.prototype.onSuggestionOut = function (that) {
    "use strict";
    that.style.background = "";
};
Widget.prototype.changesMade = function () {
    "use strict";
    if (this.settings.alias === this.dom.aliasInput.value && this.settings.userId === parseInt(this.dom.employeesInputId.value, 10) && this.settings.homeArea === this.dom.areaInput.value && this.settings.interval === parseInt(this.dom.intervalInput.value, 10) && this.settings.mute === this.dom.muteInput.checked) {
        this.dom.saveSpan.className = "disabled";
    } else {
        this.dom.saveSpan.className = "";
    }
};
Widget.prototype.onSaveClick = function (that) {
    "use strict";
    if (that.className !== "disabled") {
        this.saveSettings();
        this.saveConfig();
        this.closeSettings();
        this.dom.saveSpan.className = "disabled";
    }
};
Widget.prototype.onSettingsClick = function () {
    "use strict";
    if (document.body.getAttribute("data-showSettings") === "true") {
        this.closeSettings();
    } else {
        this.openSettings();
    }
};
/*global window, document, Widget:true, moment, ajax, console*/
function Widget() {
    "use strict";
    this.lastResult = null;
    this.currentLocationName = null;
    this.employeeList = null;
    this.settings = {
        "interval": 3000,
        "userId": 2323,
        "lastName": "Klymenko",
        "firstName": "Andrii",
        "homeArea": "Office KBP3-L",
        "mute": false
    };
    this.dom = {
        userSpan: document.getElementById("user"),
        locationSpan: document.getElementById("location"),
        backgroundEl: document.getElementById("imgBackground"),
        whenSpan: document.getElementById("when")
    };
    this.audio = {
        near: "sounds\\e-pacantre.wav",
        far: "sounds\\zbs.wav"
    };
    this.images = {
        ok: "images/OK.png",
        warn: "images/warn.png"
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
        this.dom.backgroundEl.src = "url(" + this.images.warn + ")";
        this.dom.backgroundEl.style.backgroundImage = "url(" + this.images.warn + ")";
    } else {
        if (this.lastResult === null || this.lastResult) {
            this.lastResult = false;
            this.playSound(this.audio.far);
        }
        this.dom.backgroundEl.src = "url(" + this.images.ok + ")";
        this.dom.backgroundEl.style.backgroundImage = "url(" + this.images.ok + ")";
    }
};
Widget.prototype.searchSetId = function (employees, that) {
    "use strict";
    var i;
    if (employees === undefined && that === undefined) {
        for (i = 0; i < this.employeeList.length; i += 1) {
            if (this.employeeList[i].last_name === this.settings.lastName && this.employeeList[i].first_name === this.settings.firstName) {
                this.settings.userId = this.employeeList[i].id;
            }
        }
    } else {
        that.employeeList = JSON.parse(employees);
        for (i = 0; i < that.employeeList.length; i += 1) {
            if (that.employeeList[i].last_name === that.settings.lastName && that.employeeList[i].first_name === that.settings.firstName) {
                that.settings.userId = that.employeeList[i].id;
            }
        }
    }
};
Widget.prototype.checkLidok = function (obj, that) {
    "use strict";
    var res = JSON.parse(obj);
    that.currentLocationName = res.area.replace("Office KBP", "").replace("-", "");
    that.dom.locationSpan.innerHTML = res.direction === "in" ? "Now in " +  that.currentLocationName : "Last seen in " + that.currentLocationName;
    that.dom.userSpan.innerHTML = that.settings.firstName + " " + that.settings.lastName;
    that.dom.whenSpan.innerHTML = res.direction !== "in" ? moment(res.timestamp).fromNow() : "";
    //debugger;
    if (res.area === that.settings.homeArea && res.direction === "in") {
        that.changeState(true);
    } else {
        that.changeState(false);
    }
};
Widget.prototype.detect = function () {
    "use strict";
    ajax(this.url.lastSeen + this.settings.userId, this.checkLidok, this); // VP 2189 KA 2323
};
Widget.prototype.updateEmpId = function () {
    "use strict";
    if (this.employeeList === null) {
        ajax(this.url.employees, this.searchSetId, this);
    } else {
        this.searchSetId();
    }
};
Widget.prototype.settingsClosedHandler = function (event) {// User hit OK on the settings page.
    "use strict";
    if (event.closeAction === event.Action.commit) {
        this.settings.lastName = System.Gadget.Settings.readString("LastName");
        this.settings.firstName = System.Gadget.Settings.readString("FirstName");
        this.settings.interval = System.Gadget.Settings.readString("Interval");
        this.updateEmpId();
    }
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
Widget.prototype.tst = function (text) {
    "use strict";
    this.dom.userSpan.innerHTML = text;
};
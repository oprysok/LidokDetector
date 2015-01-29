function Widget() {
    "use strict";
    this.lastResult = null;
    this.currentLocationName = null;
    this.employeeList = null;
    this.areaList = [
        {id: 0, name: "Office KBP1-C", alias: "1C"},
        {id: 0, name: "Office KBP1-R", alias: "1R"},
        {id: 0, name: "Office KBP2-R", alias: "2R"},
        {id: 0, name: "Office KBP3-C", alias: "3C"},
        {id: 0, name: "Office KBP3-D", alias: "3D"},
        {id: 0, name: "Office KBP3-G", alias: "3G"},
        {id: 0, name: "Office KBP3-L", alias: "3L"},
        {id: 0, name: "Office KBP3-R", alias: "3R"},
        {id: 0, name: "Office KBP4-C", alias: "4C"},
        {id: 0, name: "Office KBP4-G", alias: "4G"},
        {id: 0, name: "Office KBP4-L", alias: "4L"},
        {id: 0, name: "Office KBP4-R", alias: "4R"},
        {id: 0, name: "Office KBP5-C", alias: "5C"},
        {id: 0, name: "Office KBP5-G", alias: "5G"},
        {id: 0, name: "Office KBP5-L", alias: "5L"},
        {id: 0, name: "Office KBP5-R", alias: "5R"},
        {id: 0, name: "Location-KBP5C-Finance", alias: "5C-Finance"}
    ];
    this.settings = {};
    this.settingsDefault = {
        "interval": 3000,
        "userId": 2323,
        "name": "Andrii Klymenko",
        "alias": "Lidok",
        "homeArea": {name: "Office KBP3-L", alias: "3L"},
        "mute": false
    };
    this.audio = {
        near: "audioNear",
        far: "audioFar"
    };
    this.url = {
        employees: "http://172.22.212.33:3536/api/location/employees",
        lastSeen: "http://172.22.212.33:3536/api/location/kbp/"
    };
	this.status = {
		currentLocation: null,
		user: null,
		when: null
	};
}

Widget.prototype.changeState = function (detected) {
    "use strict";
    if (detected) {
        if (this.lastResult === null || !this.lastResult) {
            this.lastResult = true;
            this.playSound(this.audio.near);
			kango.ui.browserButton.setIcon("icons/button_red.png");
        }
    } else {
        if (this.lastResult === null || this.lastResult) {
            this.lastResult = false;
            this.playSound(this.audio.far);
			kango.ui.browserButton.setIcon("icons/button_green.png");
        }
    }
};

Widget.prototype.checkLidok = function (obj, that) {
    "use strict";
    var res = JSON.parse(obj);
    if (res.area !== null) {
        var currentLocationName = res.area.replace("Office KBP", "").replace("-", "");
		that.status.currentLocation = res.direction === "in" ? "Now in " +  currentLocationName : "Last seen in " + currentLocationName;
		that.status.user = that.settings.name;
		that.status.when = res.direction !== "in" ? "(" + moment(res.timestamp).fromNow() + ")" : "";
        if (res.area === that.settings.homeArea.name && res.direction === "in") {
            that.changeState(true);
        } else {
            that.changeState(false);
        }
    } else {
        //that.dom.userSpan.innerHTML = "";
        //that.dom.whenSpan.innerHTML = "";
        //that.dom.locationSpan.innerHTML = "";
        //that.dom.statusSpan.innerHTML = "Not available";
        this.removeConfig();
    }
	// send message to ui
};

Widget.prototype.detect = function () {
    "use strict";
    this.ajax(this.url.lastSeen + this.settings.userId, this.checkLidok, this);
};

Widget.prototype.storeEmployees = function (employees, that) {
    "use strict";
	kango.storage.setItem('employeeList',JSON.parse(employees));
};

Widget.prototype.getEmployees = function () {
    "use strict";
	if (kango.storage.getItem('employeeList') === null) {
		this.ajax(this.url.employees, this.storeEmployees, this);
	}
};

Widget.prototype.playSound = function (filepath) {
    "use strict";
	var audioEl = document.getElementById(filepath);
	audioEl.play();
};

Widget.prototype.saveSettings = function (config) {
    "use strict";
};

Widget.prototype.findArea = function (input) {
    'use strict';
    var i;
    for (i = 0; i < this.areaList.length; i += 1) {
        if (this.areaList[i].alias === input) {
            return this.areaList[i];
        }
    }
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

Widget.prototype.readConfig = function () {
    "use strict";
	if (kango.storage.getItem('interval') === null) {
		kango.storage.setItem('interval',this.settingsDefault.interval);
	}
	this.settings.interval = kango.storage.getItem('interval');
	if (kango.storage.getItem('userId') === null) {
		kango.storage.setItem('userId',this.settingsDefault.userId);
	}
	this.settings.userId = kango.storage.getItem('userId');
	if (kango.storage.getItem('name') === null) {
		kango.storage.setItem('name',this.settingsDefault.name);
	}
	this.settings.name = kango.storage.getItem('name');
	if (kango.storage.getItem('alias') === null) {
		kango.storage.setItem('alias',this.settingsDefault.alias);
	}
	this.settings.alias = kango.storage.getItem('alias');
	if (kango.storage.getItem('homeArea') === null) {
		kango.storage.setItem('homeArea',this.settingsDefault.homeArea);
	}
	this.settings.homeArea = kango.storage.getItem('homeArea');
	if (kango.storage.getItem('mute') === null) {
		kango.storage.setItem('mute',this.settingsDefault.mute);
	}
	this.settings.mute = kango.storage.getItem('mute');
	this.getEmployees();
};

Widget.prototype.removeConfig = function () {
    "use strict";
    kango.storage.clear();
};

Widget.prototype.init = function () {
    "use strict";
	var self = this;
    document.body.innerHTML='<audio id="audioNear" src="sounds\\e-pacantre.wav"></audio><audio id="audioFar" src="sounds\\zbs.wav" ></audio>';
	this.readConfig();
	window.setInterval(function(){self.detect()}, self.settings.interval);
};

Widget.prototype.ajax = function ($url, $object, $that) {
    "use strict";
	var details = {
        method: 'GET',
        url: $url,
        async: true,
        contentType: 'text',
		headers: {'Cache-Control': 'private, max-age=0, no-cache'}
	};
	kango.xhr.send(details, function(data) {
        if (data.status == 200 && data.response != null) {
                var text = data.response;
                //kango.console.log(text);
				$that.obj = text;
				$object(text, $that);
        }
        else { // something went wrong
                kango.console.log('something went wrong');
        }
	});
};
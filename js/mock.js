Widget.prototype.detect = function() 
{ 
	if (typeof this.locationData == "undefined") this.mockLocationData();
	this.checkLidok(this.locationData, this);
};

Widget.prototype.mockLocationData = function(direction, area, timestamp)
{
	var timeStampDefault = "2014\/03\/27 20:43:00";
	var directionDefault = "in";
	var areaDefault = this.settings.homeArea;
	if (typeof direction != "undefined") directionDefault = direction;
	if (typeof area != "undefined") areaDefault = area;
	if (typeof area != "undefined") areaDefault = area;
	this.locationData = "{\"timestamp\":\""+timeStampDefault+"\",\"locationid\":95,\"direction\":\""+directionDefault+"\",\"area\":\""+areaDefault+"\",\"working\":true}";
	this.employeeList = [{"id":2531,"last_name":"Klym","first_name":"Taras"},
	{"id":3116,"last_name":"Klymchuk","first_name":"Liudmyla"},
	{"id":2323,"last_name":"Klymenko","first_name":"Andrii"},
	{"id":3971,"last_name":"Mykhailov","first_name":"Maksym"},
	{"id":3987,"last_name":"Mykhailov","first_name":"Volodymyr"},
	{"id":2346,"last_name":"Mykhailov","first_name":"Volodymyr"},
	{"id":3957,"last_name":"Nedokushev","first_name":"Mykhailo"},
	{"id":3360,"last_name":"Monchak","first_name":"Mykhailo"},
	{"id":1963,"last_name":"Chmykhalo","first_name":"Pavlo"}];
};
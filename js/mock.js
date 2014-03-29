if (typeof System == "undefined" || typeof System.Gadget == "undefined") {

	System = {};

	System.Gadget = {};

	mockXHR.mock([
	 	{
	 	url:"http://poc-cont2-srv/polygon/json/employees", 
	 	status:"200", 
	 	responseText:"[{\"id\":2531,\"last_name\":\"Klym\",\"first_name\":\"Taras\"},{\"id\":2323,\"last_name\":\"Klymenko\",\"first_name\":\"Andrii\"},{\"id\":3971,\"last_name\":\"Mykhailov\",\"first_name\":\"Maksym\"},{\"id\":3116,\"last_name\":\"Klymchuk\",\"first_name\":\"Liudmyla\"},{\"id\":3987,\"last_name\":\"Mykhailov\",\"first_name\":\"Volodymyr\"},{\"id\":2346,\"last_name\":\"Mykhailov\",\"first_name\":\"Volodymyr\"},{\"id\":3957,\"last_name\":\"Nedokushev\",\"first_name\":\"Mykhailo\"},{\"id\":3360,\"last_name\":\"Monchak\",\"first_name\":\"Mykhailo\"},{\"id\":1963,\"last_name\":\"Chmykhalo\",\"first_name\":\"Pavlo\"}]"
		},
	 	{
	 	url:"http://poc-cont2-srv/polygon/json/last_seen?employeeId=*",
	 	status:"200", 
	 	responseText:JSON.stringify({
	 		"timestamp":"2014/03/27 20:43:00",
	 		"locationid":95,
	 		"direction":"out",
	 		"area":"Office KBP3-L",
	 		"working":true})
		}
	]);
}